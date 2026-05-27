'use client';

import React, { useState } from 'react';
import { SplitField, LogicType, RuleConditionItem, RuleCondition, RuleGroup as RuleGroupType, RuleGroupItem, Operator } from '@/lib/types';

interface RuleGroupEditorProps {
  group: RuleGroupType;
  fields: SplitField[];
  onChange: (group: RuleGroupType) => void;
  depth?: number;
}

const OPERATORS = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'in', label: '在列表中' },
  { value: 'any', label: '任意值' },
  { value: 'empty', label: '为空' },
  { value: 'not_empty', label: '不为空' },
];

const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function RuleGroupEditor({ group, fields, onChange, depth = 0 }: RuleGroupEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  // 获取条件列表
  const getConditions = (): RuleConditionItem[] => {
    return (group.items || []).filter((item): item is RuleConditionItem => item.type === 'condition');
  };

  // 获取子分组列表
  const getSubGroups = (): RuleGroupItem[] => {
    return (group.items || []).filter((item): item is RuleGroupItem => item.type === 'group');
  };

  // 更新逻辑关系
  const updateLogic = (newLogic: LogicType) => {
    onChange({ ...group, logic: newLogic });
  };

  // 添加条件
  const addCondition = () => {
    const newCondition: RuleConditionItem = {
      type: 'condition',
      id: generateId(),
      condition: {
        id: generateId(),
        fieldKey: fields[0]?.fieldKey || '',
        fieldName: fields[0]?.name || '',
        operator: 'equals' as Operator,
        value: '',
      },
    };
    onChange({ ...group, items: [...(group.items || []), newCondition] });
  };

  // 添加子分组
  const addSubGroup = () => {
    const newSubGroup: RuleGroupItem = {
      type: 'group',
      id: generateId(),
      group: {
        id: generateId(),
        logic: 'AND',
        items: [],
      },
    };
    onChange({ ...group, items: [...(group.items || []), newSubGroup] });
  };

  // 更新条件
  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    const newItems = (group.items || []).map((item) => {
      if (item.type === 'condition' && item.id === id) {
        return {
          ...item,
          condition: item.condition ? { ...item.condition, ...updates } : undefined,
        };
      }
      return item;
    });
    onChange({ ...group, items: newItems });
  };

  // 更新子分组
  const updateSubGroup = (id: string, newGroup: RuleGroupType) => {
    const newItems = (group.items || []).map((item) => {
      if (item.type === 'group' && item.id === id) {
        return {
          ...item,
          group: newGroup,
        };
      }
      return item;
    });
    onChange({ ...group, items: newItems });
  };

  // 删除项（条件或子分组）
  const removeItem = (id: string) => {
    const newItems = (group.items || []).filter((item) => item.id !== id);
    onChange({ ...group, items: newItems });
  };

  // 删除条件
  const removeCondition = (id: string) => {
    removeItem(id);
  };

  // 删除子分组
  const removeSubGroup = (id: string) => {
    removeItem(id);
  };

  const conditions = getConditions();
  const subGroups = getSubGroups();

  // 渲染单个条件
  const renderCondition = (condition: RuleConditionItem, index: number) => {
    return (
      <div key={condition.id} className="rule-condition-item group">
        {/* 条件间的关系标签（除了第一个） */}
        {index > 0 && (
          <div className="flex items-center justify-center py-1">
            <span className={`px-2 py-0.5 text-xs rounded font-medium ${
              group.logic === 'AND' 
                ? 'bg-blue-100 text-[#165DFF]' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {group.logic === 'AND' ? '且 AND' : '或 OR'}
            </span>
          </div>
        )}
        
        {/* 条件行 */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 hover:border-[#165DFF] transition-colors">
          {/* 拖拽手柄 */}
          <div className="cursor-grab text-gray-300 hover:text-gray-400">
            ⋮⋮
          </div>

          {/* 条件内容 */}
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            {/* 字段选择 */}
            <select
              value={condition.condition?.fieldKey || ''}
              onChange={(e) => {
                const field = fields.find(f => f.fieldKey === e.target.value);
                updateCondition(condition.id, { fieldKey: e.target.value, fieldName: field?.name || '' });
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#165DFF] bg-white"
            >
              {fields.map((field) => (
                <option key={field.fieldKey} value={field.fieldKey}>
                  {field.name}
                </option>
              ))}
            </select>

            {/* 操作符选择 */}
            <select
              value={condition.condition?.operator || 'equals'}
              onChange={(e) => updateCondition(condition.id, { operator: e.target.value as Operator })}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#165DFF] bg-white"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {/* 值输入框 */}
            {!['any', 'empty', 'not_empty'].includes(condition.condition?.operator || '') && (
              <input
                type="text"
                value={condition.condition?.value || ''}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                placeholder={condition.condition?.operator === 'in' ? '多个值用逗号分隔' : '输入值'}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#165DFF] flex-1 min-w-[120px]"
              />
            )}
          </div>

          {/* 删除按钮 */}
          <button
            type="button"
            onClick={() => removeCondition(condition.id)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // 渲染子分组
  const renderSubGroup = (subGroup: RuleGroupItem, index: number) => {
    if (!subGroup.group) return null;
    const subGroupData = subGroup.group;
    return (
      <div key={subGroup.id} className="rule-subgroup-item">
        {/* 分组间的关系标签（除了第一个） */}
        {index > 0 && (
          <div className="flex items-center justify-center py-1">
            <span className={`px-2 py-0.5 text-xs rounded font-medium ${
              group.logic === 'AND' 
                ? 'bg-blue-100 text-[#165DFF]' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {group.logic === 'AND' ? '且 AND' : '或 OR'}
            </span>
          </div>
        )}

        {/* 子分组内容 */}
        <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-3">
          {/* 子分组头部 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-medium">
              嵌套分组
            </span>
            
            {/* 子分组 AND/OR 切换 */}
            <div className="flex bg-white rounded-lg p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={() => updateSubGroup(subGroup.id, { ...subGroupData, logic: 'AND' })}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  subGroupData.logic === 'AND'
                    ? 'bg-[#165DFF] text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                且
              </button>
              <button
                type="button"
                onClick={() => updateSubGroup(subGroup.id, { ...subGroupData, logic: 'OR' })}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  subGroupData.logic === 'OR'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                或
              </button>
            </div>

            <div className="flex-1" />

            {/* 删除子分组按钮 */}
            <button
              type="button"
              onClick={() => removeSubGroup(subGroup.id)}
              className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              删除分组
            </button>
          </div>

          {/* 递归渲染子分组内容 */}
          <SubGroupEditor
            group={subGroupData}
            fields={fields}
            onChange={(newGroup) => updateSubGroup(subGroup.id, newGroup)}
          />
        </div>
      </div>
    );
  };

  const totalItems = conditions.length + subGroups.length;

  return (
    <div className="rule-group-editor">
      {/* 分组头部 */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded"
        >
          {collapsed ? '+' : '−'}
        </button>
        
        {/* AND/OR 切换按钮 */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => updateLogic('AND')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              group.logic === 'AND'
                ? 'bg-[#165DFF] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            且 AND
          </button>
          <button
            type="button"
            onClick={() => updateLogic('OR')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              group.logic === 'OR'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            或 OR
          </button>
        </div>

        <span className="text-sm text-gray-500">
          {totalItems === 0 ? '暂无条件' : `${totalItems} 个条件`}
        </span>
      </div>

      {/* 条件列表 */}
      {!collapsed && (
        <div className="space-y-1 pl-4 border-l-2 border-gray-200 ml-2">
          {/* 渲染所有项（条件和子分组混合） */}
          {group.items.map((item, index) => {
            if (item.type === 'condition') {
              return renderCondition(item, index);
            } else {
              return renderSubGroup(item, index);
            }
          })}

          {/* 添加按钮组 */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={addCondition}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#165DFF] hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-[#165DFF]"
            >
              <span className="text-lg">+</span>
              添加条件
            </button>
            
            <button
              type="button"
              onClick={addSubGroup}
              className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-dashed border-purple-400"
            >
              <span className="text-lg">+</span>
              添加嵌套分组
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 子分组编辑器组件（简化版本，不显示外层分组）
function SubGroupEditor({ group, fields, onChange }: Omit<RuleGroupEditorProps, 'depth'>) {
  const [collapsed, setCollapsed] = useState(false);

  const generateSubId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 获取条件列表
  const getConditions = (): RuleConditionItem[] => {
    return group.items.filter((item): item is RuleConditionItem => item.type === 'condition');
  };

  // 获取子分组列表
  const getSubGroups = (): RuleGroupItem[] => {
    return group.items.filter((item): item is RuleGroupItem => item.type === 'group');
  };

  // 更新逻辑关系
  const updateLogic = (newLogic: LogicType) => {
    onChange({ ...group, logic: newLogic });
  };

  // 添加条件
  const addCondition = () => {
    const newCondition: RuleConditionItem = {
      type: 'condition',
      id: generateSubId(),
      condition: {
        id: generateSubId(),
        fieldKey: fields[0]?.fieldKey || '',
        fieldName: fields[0]?.name || '',
        operator: 'equals' as Operator,
        value: '',
      },
    };
    onChange({ ...group, items: [...(group.items || []), newCondition] });
  };

  // 添加子分组
  const addSubGroup = () => {
    const newSubGroup: RuleGroupItem = {
      type: 'group',
      id: generateSubId(),
      group: {
        id: generateSubId(),
        logic: 'AND',
        items: [],
      },
    };
    onChange({ ...group, items: [...(group.items || []), newSubGroup] });
  };

  // 更新条件
  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    const newItems = (group.items || []).map((item) => {
      if (item.type === 'condition' && item.id === id) {
        return {
          ...item,
          condition: item.condition ? { ...item.condition, ...updates } : undefined,
        };
      }
      return item;
    });
    onChange({ ...group, items: newItems });
  };

  // 更新子分组
  const updateSubGroup = (id: string, newGroup: RuleGroupType) => {
    const newItems = (group.items || []).map((item) => {
      if (item.type === 'group' && item.id === id) {
        return {
          ...item,
          group: newGroup,
        };
      }
      return item;
    });
    onChange({ ...group, items: newItems });
  };

  // 删除项
  const removeItem = (id: string) => {
    const newItems = (group.items || []).filter((item) => item.id !== id);
    onChange({ ...group, items: newItems });
  };

  const conditions = getConditions();
  const subGroups = getSubGroups();
  const totalItems = conditions.length + subGroups.length;

  // 渲染单个条件
  const renderCondition = (condition: RuleConditionItem, index: number) => {
    return (
      <div key={condition.id} className="rule-condition-item group">
        {index > 0 && (
          <div className="flex items-center justify-center py-1">
            <span className={`px-2 py-0.5 text-xs rounded font-medium ${
              group.logic === 'AND' 
                ? 'bg-blue-100 text-[#165DFF]' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {group.logic === 'AND' ? '且 AND' : '或 OR'}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 hover:border-[#165DFF] transition-colors">
          <div className="cursor-grab text-gray-300 hover:text-gray-400">
            ⋮⋮
          </div>

          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <select
              value={condition.condition?.fieldKey || ''}
              onChange={(e) => {
                const field = fields.find(f => f.fieldKey === e.target.value);
                updateCondition(condition.id, { fieldKey: e.target.value, fieldName: field?.name || '' });
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#165DFF] bg-white"
            >
              {fields.map((field) => (
                <option key={field.fieldKey} value={field.fieldKey}>
                  {field.name}
                </option>
              ))}
            </select>

            <select
              value={condition.condition?.operator || 'equals'}
              onChange={(e) => updateCondition(condition.id, { operator: e.target.value as Operator })}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#165DFF] bg-white"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {!['any', 'empty', 'not_empty'].includes(condition.condition?.operator || '') && (
              <input
                type="text"
                value={condition.condition?.value || ''}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                placeholder={condition.condition?.operator === 'in' ? '多个值用逗号分隔' : '输入值'}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#165DFF] flex-1 min-w-[120px]"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => removeItem(condition.id)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // 渲染子分组
  const renderSubGroup = (subGroup: RuleGroupItem, index: number) => {
    if (!subGroup.group) return null;
    const subGroupData = subGroup.group;
    return (
      <div key={subGroup.id} className="rule-subgroup-item">
        {index > 0 && (
          <div className="flex items-center justify-center py-1">
            <span className={`px-2 py-0.5 text-xs rounded font-medium ${
              group.logic === 'AND' 
                ? 'bg-blue-100 text-[#165DFF]' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {group.logic === 'AND' ? '且 AND' : '或 OR'}
            </span>
          </div>
        )}

        <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-medium">
              嵌套分组
            </span>
            
            <div className="flex bg-white rounded-lg p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={() => updateSubGroup(subGroup.id, { ...subGroupData, logic: 'AND' })}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  subGroupData.logic === 'AND'
                    ? 'bg-[#165DFF] text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                且
              </button>
              <button
                type="button"
                onClick={() => updateSubGroup(subGroup.id, { ...subGroupData, logic: 'OR' })}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  subGroupData.logic === 'OR'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                或
              </button>
            </div>

            <div className="flex-1" />

            <button
              type="button"
              onClick={() => removeItem(subGroup.id)}
              className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              删除分组
            </button>
          </div>

          <SubGroupEditor
            group={subGroupData}
            fields={fields}
            onChange={(newGroup) => updateSubGroup(subGroup.id, newGroup)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="sub-group-editor">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded text-xs"
        >
          {collapsed ? '+' : '−'}
        </button>
        
        <div className="flex bg-gray-50 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => updateLogic('AND')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              group.logic === 'AND'
                ? 'bg-[#165DFF] text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            且
          </button>
          <button
            type="button"
            onClick={() => updateLogic('OR')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              group.logic === 'OR'
                ? 'bg-orange-500 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            或
          </button>
        </div>

        <span className="text-xs text-gray-500">
          {totalItems === 0 ? '暂无' : `${totalItems}项`}
        </span>
      </div>

      {!collapsed && (
        <div className="space-y-1 pl-4 border-l-2 border-purple-200 ml-2">
          {(group.items || []).map((item, index) => {
            if (item.type === 'condition') {
              return renderCondition(item, index);
            } else {
              return renderSubGroup(item, index);
            }
          })}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={addCondition}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#165DFF] hover:bg-blue-50 rounded-lg transition-colors"
            >
              + 条件
            </button>
            
            <button
              type="button"
              onClick={addSubGroup}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              + 分组
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 辅助函数：从分组构建规则描述
export function buildRuleDescription(group: RuleGroupType, fields: SplitField[]): string {
  const conditions = (group.items || []).filter((item): item is RuleConditionItem => item.type === 'condition');
  if (conditions.length === 0) return '';
  
  const parts = conditions.map((c, index) => {
    const fieldKey = c.condition?.fieldKey || c.condition?.field || '';
    const fieldName = fields.find(f => f.fieldKey === fieldKey)?.name || fieldKey;
    const operatorLabel = OPERATORS.find(o => o.value === c.condition?.operator)?.label || c.condition?.operator || '';
    
    let desc = `${fieldName} ${operatorLabel}`;
    if (c.condition?.value) {
      desc += ` "${c.condition.value}"`;
    }
    
    if (index > 0) {
      desc = `(${group.logic === 'AND' ? '且' : '或'} ${desc})`;
    }
    
    return desc;
  });
  
  return parts.join(` ${group.logic === 'AND' ? '且' : '或'} `);
}
