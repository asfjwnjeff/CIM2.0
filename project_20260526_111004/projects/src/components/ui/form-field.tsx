'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  /** 标签右侧提示图标后显示的信息文本 */
  hint?: string;
  /** 字段下方的辅助说明文字 */
  description?: string;
  /** 字数统计 "{current}/{max}" */
  charCount?: string;
  /** 字段下方的错误文字（由 ValidationMessage 组件提供） */
  error?: string;
  /** 子元素（输入组件） */
  children: React.ReactNode;
  className?: string;
}

/**
 * 表单字段包装组件
 * 统一字段布局: 标签在上 → 输入区域 → 辅助文字/字数 → 错误提示
 */
export function FormField({
  label,
  required,
  optional,
  hint,
  description,
  charCount,
  error,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      {/* 标签行 */}
      <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">
        {label}
        {required && <span className="text-[#D63031] ml-0.5">*</span>}
        {optional && <span className="text-[#999999] font-normal text-xs ml-1">(选填)</span>}
        {hint && (
          <span
            className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[#999999] hover:text-[#5A5A5A] cursor-help"
            title={hint}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        )}
      </label>

      {/* 输入/选择区域 */}
      {children}

      {/* 辅助行: 说明文字 | 错误提示 | 字数统计 */}
      {(description || charCount || error) && (
        <div className={`mt-1 flex items-center gap-2 min-h-[20px] ${error ? 'justify-between' : charCount ? 'justify-between' : ''}`}>
          <div className="flex-1">
            {error ? (
              <p className="text-xs text-[#D63031] leading-tight">{error}</p>
            ) : description ? (
              <p className="text-xs text-[#999999] leading-tight">{description}</p>
            ) : null}
          </div>
          {charCount && (
            <span className="text-xs text-[#999999] shrink-0">{charCount}</span>
          )}
        </div>
      )}
    </div>
  );
}
