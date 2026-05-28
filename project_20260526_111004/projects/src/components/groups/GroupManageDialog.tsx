'use client';

import React, { useState, useCallback } from 'react';
import {
  type GroupDefinition,
  type GroupCondition,
  type GroupConditionOperator,
  type GroupFieldMeta,
} from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ====== 条件编辑器行 ======

interface ConditionRowProps {
  condition: GroupCondition;
  fields: GroupFieldMeta[];
  onChange: (cond: GroupCondition) => void;
  onDelete: () => void;
}

const OPERATOR_LABELS: Record<string, string> = {
  equals: '等于', not_equals: '不等于',
  contains: '包含', not_contains: '不包含',
  in: '属于', not_in: '不属于',
  gt: '大于', gte: '大于等于', lt: '小于', lte: '小于等于',
  today: '是今天', this_week: '本周', this_month: '本月', this_year: '今年',
  empty: '为空', not_empty: '不为空',
};

function getOperatorsByType(type: string): GroupConditionOperator[] {
  const ops: GroupConditionOperator[] = type === 'select' ? ['equals', 'not_equals', 'in', 'not_in', 'empty', 'not_empty']
    : type === 'string' ? ['equals', 'contains', 'not_contains', 'empty', 'not_empty']
    : type === 'number' ? ['equals', 'gt', 'gte', 'lt', 'lte', 'not_equals', 'empty', 'not_empty']
    : type === 'date' ? ['today', 'this_week', 'this_month', 'this_year', 'equals', 'empty', 'not_empty']
    : type === 'multiselect' ? ['contains', 'not_contains', 'empty', 'not_empty']
    : ['equals', 'contains', 'empty', 'not_empty'];
  return ops;
}

function ValueInput({
  fieldMeta,
  condition,
  onChange,
}: {
  fieldMeta: GroupFieldMeta | undefined;
  condition: GroupCondition;
  onChange: (cond: GroupCondition) => void;
}) {
  const noValueOps = ['empty', 'not_empty', 'today', 'this_week', 'this_month', 'this_year'];

  if (noValueOps.includes(condition.operator)) {
    return <div className="h-9 flex items-center text-xs text-[#999999]">无需输入值</div>;
  }

  if (fieldMeta?.type === 'select' && (condition.operator === 'equals' || condition.operator === 'not_equals')) {
    return (
      <Select value={condition.value} onValueChange={v => onChange({ ...condition, value: v })}>
        <SelectTrigger className="min-w-[120px] h-9 text-xs">
          <SelectValue placeholder="选择值" />
        </SelectTrigger>
        <SelectContent>
          {(fieldMeta.options || []).map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      value={condition.value}
      onChange={e => onChange({ ...condition, value: e.target.value })}
      placeholder={fieldMeta?.type === 'number' ? '输入数值' : '输入值，多值逗号分隔'}
      className="min-w-[140px] h-9 text-xs"
    />
  );
}

function ConditionRow({ condition, fields, onChange, onDelete }: ConditionRowProps) {
  const selectedField = fields.find(f => f.key === condition.field);
  const operators = getOperatorsByType(selectedField?.type || 'string');

  return (
    <div className="flex items-center gap-2 py-1.5">
      {/* 字段选择 */}
      <Select value={condition.field} onValueChange={v => onChange({ ...condition, field: v, operator: getOperatorsByType(fields.find(f => f.key === v)?.type || 'string')[0] })}>
        <SelectTrigger className="min-w-[110px] h-9 text-xs">
          <SelectValue placeholder="选择字段" />
        </SelectTrigger>
        <SelectContent>
          {fields.map(f => (
            <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 操作符选择 */}
      <Select value={condition.operator} onValueChange={v => onChange({ ...condition, operator: v as GroupConditionOperator })}>
        <SelectTrigger className="min-w-[100px] h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map(op => (
            <SelectItem key={op} value={op}>{OPERATOR_LABELS[op] || op}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 值输入 */}
      <ValueInput fieldMeta={selectedField} condition={condition} onChange={onChange} />

      {/* 删除按钮 */}
      <button
        onClick={onDelete}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-[#999999] hover:text-[#D63031] hover:bg-[#FFF0F0] transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ====== 分组管理弹窗 ======

interface GroupManageDialogProps {
  open: boolean;
  onClose: () => void;
  groups: GroupDefinition[];
  editingGroup: GroupDefinition | null;
  fieldMeta: GroupFieldMeta[];
  onSave: (name: string, conditions: GroupCondition[]) => void;
  onUpdate: (id: string, name: string, conditions: GroupCondition[]) => void;
  onDelete: (id: string) => void;
}

function genCondId(): string {
  return `cond-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function GroupManageDialog({
  open,
  onClose,
  groups,
  editingGroup,
  fieldMeta,
  onSave,
  onUpdate,
  onDelete,
}: GroupManageDialogProps) {
  const [name, setName] = useState('');
  const [conditions, setConditions] = useState<GroupCondition[]>([]);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (editingGroup) {
        setEditingId(editingGroup.id);
        setName(editingGroup.name);
        setConditions(editingGroup.conditions.map(c => ({ ...c })));
        setMode('edit');
      } else {
        setEditingId(null);
        setName('');
        setConditions([{ id: genCondId(), field: fieldMeta[0]?.key || '', operator: 'equals', value: '' }]);
        setMode('list');
      }
    }
  }, [open, editingGroup, fieldMeta]);

  const addCondition = useCallback(() => {
    setConditions(prev => [...prev, { id: genCondId(), field: fieldMeta[0]?.key || '', operator: 'equals', value: '' }]);
  }, [fieldMeta]);

  const updateCondition = useCallback((index: number, cond: GroupCondition) => {
    setConditions(prev => prev.map((c, i) => (i === index ? cond : c)));
  }, []);

  const removeCondition = useCallback((index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      onUpdate(editingId, name.trim(), conditions);
    } else {
      onSave(name.trim(), conditions);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingId) return;
    onDelete(editingId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'list' ? '分组管理' : (editingGroup ? '编辑分组' : '新建分组')}
          </DialogTitle>
        </DialogHeader>

        {mode === 'edit' ? (
          <div className="space-y-4">
            {/* 分组名称 */}
            <div>
              <label className="text-xs font-medium text-[#0A0A0A] mb-1.5 block">分组名称</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="输入分组名称"
                maxLength={20}
                className="h-9 text-sm"
              />
            </div>

            {/* 筛选条件 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#0A0A0A]">筛选条件</label>
                <span className="text-[10px] text-[#999999]">所有条件同时满足（AND）</span>
              </div>

              <div className="space-y-1 bg-[#FAFAFA] rounded-lg p-3 border border-[#EBEBEB]">
                {conditions.length === 0 ? (
                  <p className="text-xs text-[#999999] text-center py-4">暂无条件，点击下方按钮添加</p>
                ) : (
                  conditions.map((cond, index) => (
                    <ConditionRow
                      key={cond.id}
                      condition={cond}
                      fields={fieldMeta}
                      onChange={(c) => updateCondition(index, c)}
                      onDelete={() => removeCondition(index)}
                    />
                  ))
                )}

                <button
                  onClick={addCondition}
                  className="w-full flex items-center justify-center gap-1 py-2 text-xs text-[#2D3BFF] hover:bg-[#E8EBFF] rounded-md transition-colors mt-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  添加条件
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EBEBEB]">
              <div>
                {editingGroup && (
                  <Button variant="ghost" size="sm" onClick={handleDelete} className="text-[#D63031] hover:text-[#D63031] hover:bg-[#FFEBEE] h-8 text-xs">
                    删除分组
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setMode('list')} className="h-8 text-xs">取消</Button>
                <Button size="sm" onClick={handleSave} disabled={!name.trim()} className="h-8 text-xs">保存分组</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 max-h-[360px] overflow-y-auto">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  group.isSystem
                    ? 'bg-[#F5F5F5] text-[#999999]'
                    : 'hover:bg-[#F5F5F5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${group.isSystem ? 'text-[#999999]' : 'text-[#0A0A0A] font-medium'}`}>
                    {group.name}
                  </span>
                  {group.isSystem && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EBEBEB] text-[#999999]">系统</span>
                  )}
                  {!group.isSystem && group.conditions.length > 0 && (
                    <span className="text-[10px] text-[#999999]">{group.conditions.length} 个条件</span>
                  )}
                </div>

                {!group.isSystem && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(group.id);
                        setMode('edit');
                        setName(group.name);
                        setConditions(group.conditions.map(c => ({ ...c })));
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded text-[#999999] hover:text-[#2D3BFF] hover:bg-[#E8EBFF] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(group.id)}
                      className="w-7 h-7 flex items-center justify-center rounded text-[#999999] hover:text-[#D63031] hover:bg-[#FFF0F0] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {groups.filter(g => !g.isSystem).length === 0 && (
              <p className="text-xs text-[#999999] text-center py-6">暂无自定义分组</p>
            )}

            <div className="pt-3 border-t border-[#EBEBEB]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  setMode('edit');
                  setName('');
                  setConditions([{ id: genCondId(), field: fieldMeta[0]?.key || '', operator: 'equals', value: '' }]);
                }}
                className="w-full h-9 text-xs"
              >
                新建自定义分组
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
