'use client';

import React from 'react';
import type { ApprovalField } from '@/lib/types';

interface MobileDynamicFieldsProps {
  fields: ApprovalField[];
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
}

const FIELD_TYPE_CONFIG: Record<string, { label: string; placeholder?: string }> = {
  boolean: { label: '是/否' },
  single_select: { label: '单选' },
  multi_select: { label: '多选' },
  single_other: { label: '单选+其他' },
  percentage: { label: '百分比', placeholder: '输入百分比数值' },
  number: { label: '数字', placeholder: '请输入数字' },
};

export default function MobileDynamicFields({ fields, values, onChange }: MobileDynamicFieldsProps) {
  if (!fields || fields.length === 0) {
    return (
      <div className="text-xs text-[#999999] py-3 text-center">
        当前服务产品无需额外合规审核字段
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <DynamicFieldRow
          key={field.id || field.fieldKey}
          field={field}
          value={values[field.fieldKey] || ''}
          onChange={(val) => onChange(field.fieldKey, val)}
        />
      ))}
    </div>
  );
}

function DynamicFieldRow({
  field,
  value,
  onChange,
}: {
  field: ApprovalField;
  value: string;
  onChange: (val: string) => void;
}) {
  const config = FIELD_TYPE_CONFIG[field.fieldType] || FIELD_TYPE_CONFIG.text;
  const isRequired = field.isRequired;

  return (
    <div>
      <label className="text-sm font-medium text-[#0A0A0A] block mb-1.5">
        {field.name}
        {isRequired && <span className="text-[#D63031] ml-0.5">*</span>}
      </label>

      {field.fieldType === 'boolean' && (
        <select
          className="w-full h-10 px-3 border border-[#EBEBEB] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">请选择</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      )}

      {field.fieldType === 'single_select' && field.options && (
        <select
          className="w-full h-10 px-3 border border-[#EBEBEB] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">请选择</option>
          {field.options.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.fieldType === 'multi_select' && field.options && (
        <MultiSelectField field={field} value={value} onChange={onChange} />
      )}

      {field.fieldType === 'single_other' && field.options && (
        <SingleOtherField field={field} value={value} onChange={onChange} />
      )}

      {field.fieldType === 'percentage' && (
        <div className="relative">
          <input
            type="number"
            className="w-full h-10 px-3 pr-8 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF]"
            placeholder={config.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min="0"
            max="100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#999999]">%</span>
        </div>
      )}

      {field.fieldType === 'number' && (
        <input
          type="number"
          className="w-full h-10 px-3 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF]"
          placeholder={config.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {!['boolean', 'single_select', 'multi_select', 'single_other', 'percentage', 'number'].includes(field.fieldType) && (
        <input
          type="text"
          className="w-full h-10 px-3 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF]"
          placeholder="请输入"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

/** 多选字段 */
function MultiSelectField({
  field,
  value,
  onChange,
}: {
  field: ApprovalField;
  value: string;
  onChange: (val: string) => void;
}) {
  const selected = value ? value.split(',').filter(Boolean) : [];
  const options = field.options || [];

  const toggleOption = (optLabel: string) => {
    const next = selected.includes(optLabel)
      ? selected.filter((s) => s !== optLabel)
      : [...selected, optLabel];
    onChange(next.join(','));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const label = opt.label;
          const isSelected = selected.includes(label);
          return (
            <button
              key={label}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSelected
                  ? 'bg-[#E8EBFF] border-[#2D3BFF] text-[#2D3BFF]'
                  : 'bg-white border-[#EBEBEB] text-[#5A5A5A]'
              }`}
              onClick={() => toggleOption(label)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 单选+其他字段 */
function SingleOtherField({
  field,
  value,
  onChange,
}: {
  field: ApprovalField;
  value: string;
  onChange: (val: string) => void;
}) {
  const options = field.options || [];
  const isOtherSelected = value && !options.some((o) => o.label === value);
  const mainValue = isOtherSelected ? '其他' : value;
  const otherText = isOtherSelected ? value : '';

  return (
    <div className="space-y-2">
      <select
        className="w-full h-10 px-3 border border-[#EBEBEB] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF]"
        value={mainValue}
        onChange={(e) => {
          if (e.target.value === '其他') {
            onChange(otherText || '');
          } else {
            onChange(e.target.value);
          }
        }}
      >
        <option value="">请选择</option>
        {options.map((opt) => (
          <option key={opt.label} value={opt.label}>
            {opt.label}
          </option>
        ))}
        <option value="其他">其他</option>
      </select>
      {(mainValue === '其他' || isOtherSelected) && (
        <input
          type="text"
          className="w-full h-10 px-3 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF]"
          placeholder="请输入其他内容"
          value={otherText}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
