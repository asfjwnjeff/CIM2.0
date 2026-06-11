'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { BillingRule, RuleGroup, RuleCondition } from '@/lib/types';
import { initialCustomerBillingFields } from '@/lib/sample-data';
import RuleGroupEditor from '@/components/RuleGroupEditor';

// 生成唯一ID
const generateId = () => `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 初始根分组
const createRootGroup = (): RuleGroup => ({
  id: `group-${Date.now()}`,
  logic: 'AND',
  items: [],
});

// 操作符配置
const OPERATORS = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'contains', label: '包含' },
  { value: 'not_contains', label: '不包含' },
  { value: 'is_empty', label: '为空' },
  { value: 'not_empty', label: '不为空' },
  { value: 'in_list', label: '在列表中' },
  { value: 'not_in_list', label: '不在列表中' },
];

// 获取指定客户的账单区分字段（排除账单主体）
function getCustomerConditionFields(customerId: string): { name: string; fieldKey: string; options: string[] }[] {
  return initialCustomerBillingFields
    .filter(f => f.customerId === customerId && f.name !== '账单主体')
    .map(f => ({ name: f.name, fieldKey: f.name, options: f.options }));
}

// 获取指定客户的账单主体可选值
function getCustomerBillingEntities(customerId: string): string[] {
  const field = initialCustomerBillingFields.find(
    f => f.customerId === customerId && f.name === '账单主体'
  );
  return field?.options || [];
}

// 获取指定客户的字段可选值映射（用于条件值下拉）
function getCustomerFieldOptions(customerId: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  initialCustomerBillingFields
    .filter(f => f.customerId === customerId)
    .forEach(f => { result[f.name] = f.options; });
  return result;
}

export default function RulesPage() {
  const { billingRules, customers, addBillingRule, updateBillingRule, deleteBillingRule } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<BillingRule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    conditionGroup: createRootGroup(),
    targetBillingEntity: '',
    status: 'active' as 'active' | 'inactive',
    remark: '',
    priority: 0,
  });

  // 根据选中客户获取条件字段和可选值
  const customerConditionFields = useMemo(() =>
    getCustomerConditionFields(formData.customerId),
    [formData.customerId]
  );
  const customerFieldOpts = useMemo(() =>
    getCustomerFieldOptions(formData.customerId),
    [formData.customerId]
  );
  const customerBillingEntityOptions = useMemo(() =>
    getCustomerBillingEntities(formData.customerId),
    [formData.customerId]
  );

  // 过滤规则
  const filteredRules = useMemo(() => {
    return billingRules.filter(rule => {
      const matchSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.targetBillingEntity?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || rule.status === filterStatus;
      const matchCustomer = filterCustomer === 'all' || rule.customerId === filterCustomer;
      return matchSearch && matchStatus && matchCustomer;
    });
  }, [billingRules, searchTerm, filterStatus, filterCustomer]);

  // 打开新增弹窗
  const handleAdd = useCallback(() => {
    setEditingRule(null);
    setFormData({
      name: '',
      customerId: filterCustomer !== 'all' ? filterCustomer : (customers[0]?.id || ''),
      conditionGroup: createRootGroup(),
      targetBillingEntity: '',
      status: 'active',
      remark: '',
      priority: 0,
    });
    setShowModal(true);
  }, [customers, filterCustomer]);

  // 打开编辑弹窗
  const handleEdit = useCallback((rule: BillingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      customerId: rule.customerId || '',
      conditionGroup: rule.conditionGroup || createRootGroup(),
      targetBillingEntity: rule.targetBillingEntity || '',
      status: rule.status,
      remark: rule.remark || '',
      priority: rule.priority ?? 0,
    });
    setShowModal(true);
  }, []);

  // 保存规则
  const handleSave = useCallback(() => {
    if (!formData.name.trim() || !formData.targetBillingEntity || !formData.customerId) {
      alert('请填写规则名称、所属客户和目标账单主体');
      return;
    }

    if ((formData.conditionGroup.items || []).length === 0) {
      alert('请至少添加一个条件');
      return;
    }

    if (editingRule) {
      updateBillingRule(editingRule.id, {
        name: formData.name,
        customerId: formData.customerId,
        conditionGroup: formData.conditionGroup,
        targetBillingEntity: formData.targetBillingEntity,
        status: formData.status,
        remark: formData.remark,
      });
    } else {
      addBillingRule({
        name: formData.name,
        customerId: formData.customerId,
        conditionGroup: formData.conditionGroup,
        targetBillingEntity: formData.targetBillingEntity,
        status: formData.status,
        remark: formData.remark,
        priority: formData.priority || 0,
      });
    }

    setShowModal(false);
  }, [formData, editingRule, addBillingRule, updateBillingRule]);

  // 删除规则
  const handleDelete = useCallback((id: string) => {
    deleteBillingRule(id);
    setShowDeleteConfirm(null);
  }, [deleteBillingRule]);

  // 切换规则展开
  const toggleRule = useCallback((ruleId: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  }, []);

  // 渲染条件预览
  const renderConditionPreview = (condition: { fieldKey?: string; fieldName?: string; field?: string; operator: string; value: string } | undefined) => {
    if (!condition) return '未知条件';
    const fieldName = condition.fieldName || condition.field || '未知字段';
    const operatorLabel = OPERATORS.find(op => op.value === condition.operator)?.label || condition.operator;
    const noValueOps = ['is_empty', 'not_empty'];
    if (noValueOps.includes(condition.operator)) {
      return `${fieldName} ${operatorLabel}`;
    }
    return `${fieldName} ${operatorLabel} "${condition.value || '任意'}"`;
  };

  // 渲染分组预览
  const renderGroupPreview = (group: RuleGroup, depth = 0): React.ReactNode => {
    return (group.items || []).map((item, index) => {
      if (item.type === 'group' && item.group) {
        return (
          <React.Fragment key={item.id}>
            {index > 0 && <span className="text-[#2D3BFF] font-medium mx-1">{group.logic}</span>}
            <div className="inline-flex items-center gap-1 ml-2">
              <span className="text-[#2D3BFF] font-medium bg-[#F3F0FF] px-2 py-0.5 rounded-lg text-xs">{item.group.logic === 'AND' ? '且' : '或'}</span>
              <div className="inline-flex items-center gap-1 border-l-2 border-[#EBEBEB] pl-2">
                {renderGroupPreview(item.group, depth + 1)}
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment key={item.id}>
            {index > 0 && <span className="text-[#2D3BFF] font-medium mx-1">{group.logic}</span>}
            <span className="bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-lg text-sm">
              {renderConditionPreview(item.condition)}
            </span>
          </React.Fragment>
        );
      }
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">
            账单主体规则管理
          </h1>
          <p className="text-[#5A5A5A] mt-2 text-sm">配置订单拆分规则，自动匹配账单主体</p>
        </div>
        <button
          onClick={handleAdd}
          className="group flex items-center gap-2 px-5 py-2.5 bg-[#2D3BFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all duration-300 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增规则
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[280px] relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索规则名称或账单主体..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
          />
        </div>
        <select
          value={filterCustomer}
          onChange={(e) => setFilterCustomer(e.target.value)}
          className="px-4 py-3 bg-white border border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#2D3BFF] cursor-pointer hover:border-[#2D3BFF] transition-colors"
        >
          <option value="all">全部客户</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-white border border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#2D3BFF] cursor-pointer hover:border-[#2D3BFF] transition-colors"
        >
          <option value="all">全部状态</option>
          <option value="active">已启用</option>
          <option value="inactive">已禁用</option>
        </select>
        {/* 规则数量统计 */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#E8EBFF] border border-[#2D3BFF]/20 rounded-xl">
          <svg className="w-5 h-5 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-sm text-[#5A5A5A]">
            {filterCustomer === 'all' ? '总计' : customers.find(c => c.id === filterCustomer)?.name}
          </span>
          <span className="text-lg font-bold text-[#2D3BFF]">{filteredRules.length}</span>
          <span className="text-sm text-[#5A5A5A]">条规则</span>
        </div>
      </div>

      {/* 规则列表 */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[#EBEBEB] p-12 text-center">
            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">暂无规则</h3>
            <p className="text-[#999999] mb-5">创建您的第一条账单拆分规则</p>
            <button 
              onClick={handleAdd} 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D3BFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              创建规则
            </button>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div key={rule.id} className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-[#EBEBEB] overflow-hidden hover:border-[#2D3BFF]/30 hover:shadow-lg hover:shadow-[#2D3BFF]/5 transition-all duration-300">
              {/* 规则头部 */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#F5F5F5] transition-all"
                onClick={() => toggleRule(rule.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${expandedRules.has(rule.id) ? 'bg-[#2D3BFF] text-white rotate-90' : 'bg-[#F5F5F5] text-[#5A5A5A] group-hover:bg-[#2D3BFF]/10'}`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-[#0A0A0A] group-hover:text-[#2D3BFF] transition-colors">{rule.name}</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${rule.status === 'active' ? 'bg-[#0D8A5E]/10 text-[#0D8A5E]' : 'bg-[#999999]/10 text-[#999999]'}`}>
                      {rule.status === 'active' ? '已启用' : '已禁用'}
                    </span>
                    {rule.customerId && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#F3F0FF] text-[#2D3BFF]">
                        {customers.find(c => c.id === rule.customerId)?.name || '未知客户'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#5A5A5A]">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="font-medium text-[#2D3BFF]">{rule.targetBillingEntity}</span>
                    </span>
                    {rule.remark && <span className="text-[#999999]">| {rule.remark}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(rule); }}
                    className="p-2.5 text-[#5A5A5A] hover:text-[#2D3BFF] hover:bg-[#2D3BFF]/10 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(rule.id); }}
                    className="p-2.5 text-[#5A5A5A] hover:text-[#FF4757] hover:bg-[#FF4757]/10 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 展开的详情 */}
              {expandedRules.has(rule.id) && (
                <div className="border-t border-[#EBEBEB] p-5 bg-[#FAFAFA]">
                  <div className="text-sm text-[#5A5A5A]">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-semibold text-[#0A0A0A]">匹配条件</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 ml-6">
                      {rule.conditionGroup && renderGroupPreview(rule.conditionGroup)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 操作日志 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[#EBEBEB] mt-6">
        <div className="p-4 border-b border-[#EBEBEB]">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">操作日志</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F5F5] text-[#5A5A5A] text-sm font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">操作时间</th>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">操作人</th>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">操作类型</th>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">操作对象</th>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">操作详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-sm text-[#5A5A5A] whitespace-nowrap">2024-01-15 14:30:00</td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">系统管理员</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8FCEF] text-[#22C55E]">新增</span>
                </td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">应用材料-8635规则</td>
                <td className="px-4 py-3 text-sm text-[#5A5A5A]">新增规则 &ldquo;应用材料-8635&rdquo;</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-sm text-[#5A5A5A] whitespace-nowrap">2024-01-15 13:20:00</td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">张三</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#F59E0B]">修改</span>
                </td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">飞雅贸易-8639规则</td>
                <td className="px-4 py-3 text-sm text-[#5A5A5A]">修改规则条件配置</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-sm text-[#5A5A5A] whitespace-nowrap">2024-01-14 16:45:00</td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">李四</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#EF4444]">删除</span>
                </td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">荏原-8641规则</td>
                <td className="px-4 py-3 text-sm text-[#5A5A5A]">删除规则</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-sm text-[#5A5A5A] whitespace-nowrap">2024-01-14 10:15:00</td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">系统管理员</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8EBFF] text-[#2D3BFF]">启用</span>
                </td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">华力-8644规则</td>
                <td className="px-4 py-3 text-sm text-[#5A5A5A]">启用规则</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-sm text-[#5A5A5A] whitespace-nowrap">2024-01-13 09:30:00</td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">王五</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3F0FF] text-[#2D3BFF]">禁用</span>
                </td>
                <td className="px-4 py-3 text-sm text-[#0A0A0A] whitespace-nowrap">苏斯贸易-8603规则</td>
                <td className="px-4 py-3 text-sm text-[#5A5A5A]">禁用规则</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBEBEB] bg-[#FAFAFA]">
              <h2 className="text-xl font-bold text-[#0A0A0A]">
                {editingRule ? '编辑规则' : '新增规则'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2.5 text-[#999999] hover:text-[#0A0A0A] hover:bg-[#EBEBEB] rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] space-y-5">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">
                    规则名称 <span className="text-[#FF4757]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如: FWD部门上海Plant规则"
                    className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">
                    所属客户 <span className="text-[#FF4757]">*</span>
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#2D3BFF] cursor-pointer"
                  >
                    <option value="">请选择客户</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">
                    账单主体 <span className="text-[#FF4757]">*</span>
                  </label>
                  <select
                    value={formData.targetBillingEntity}
                    onChange={(e) => setFormData({ ...formData, targetBillingEntity: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#2D3BFF] cursor-pointer"
                    disabled={!formData.customerId}
                  >
                    <option value="">{formData.customerId ? '请选择账单主体' : '请先选择客户'}</option>
                    {customerBillingEntityOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">
                    状态
                  </label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="w-4 h-4 text-[#2D3BFF] accent-[#2D3BFF]"
                      />
                      <span className="text-sm text-[#5A5A5A] group-hover:text-[#0A0A0A] transition-colors">启用</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === 'inactive'}
                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                        className="w-4 h-4 text-[#999999] accent-[#999999]"
                      />
                      <span className="text-sm text-[#5A5A5A] group-hover:text-[#0A0A0A] transition-colors">禁用</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 规则编辑器 */}
              <div>
                <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">
                  条件组合 <span className="text-[#FF4757]">*</span>
                </label>
                <div className="border border-[#EBEBEB] rounded-xl p-4 bg-[#FAFAFA]">
                  <RuleGroupEditor
                    group={formData.conditionGroup}
                    onChange={(newGroup) => setFormData({ ...formData, conditionGroup: newGroup })}
                    fields={customerConditionFields}
                    customerFieldOptions={customerFieldOpts}
                  />
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-semibold text-[#0A0A0A] mb-2">
                  备注说明
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="可选，添加规则说明..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#EBEBEB] rounded-xl focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all resize-none"
                />
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#EBEBEB] bg-[#FAFAFA]">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-[#5A5A5A] hover:text-[#0A0A0A] hover:bg-[#EBEBEB] rounded-xl transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#2D3BFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all"
              >
                {editingRule ? '保存修改' : '创建规则'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF4757]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FF4757]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A] mb-2">确认删除</h3>
              <p className="text-[#5A5A5A] mb-6">删除后无法恢复，确定要删除这条规则吗？</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-5 py-2.5 text-[#5A5A5A] hover:text-[#0A0A0A] hover:bg-[#EBEBEB] rounded-xl transition-all"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-5 py-2.5 bg-[#FF4757] text-white rounded-xl hover:shadow-lg hover:shadow-[#FF4757]/20 transition-all"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
