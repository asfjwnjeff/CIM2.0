'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FIELD_STYLES } from '@/lib/ui-constants';

const serviceProductOptions = ['货代', '关务', '仓储', '运输', '进出口', '维修', '合同物流', '其他'];

const actionTypes = [
  { value: 'auto_approve', label: '自动通过', description: '满足条件时标记为通过' },
  { value: 'auto_reject', label: '自动拒绝', description: '满足条件时标记为拒绝' },
  { value: 'add_approver', label: '添加审批人', description: '自动在审批流程中追加指定审批人' },
  { value: 'show_message', label: '显示提示', description: '展示风险评估提示信息（含原因）' },
];

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  type: string;
  target: string;
  message: string;
}

export default function NewAutoRulePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [approvalPoint, setApprovalPoint] = useState('');
  const [serviceProduct, setServiceProduct] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [remark, setRemark] = useState('');
  const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<Condition[]>([
    { field: '', operator: '', value: '' },
  ]);
  const [actions, setActions] = useState<Action[]>([
    { type: 'show_message', target: '', message: '' },
  ]);
  const { addAutoApprovalRule, approvalFields } = useApp();
  const formData = { name, approvalPoint, serviceProduct, status, remark, conditionLogic, conditions, actions };

  const fieldOptions = useMemo(() => {
    return approvalFields
      .filter(f => f.status === 'active')
      .map(f => ({ value: f.fieldKey, label: f.name }));
  }, [approvalFields]);

  const getOperators = (fieldKey: string): { value: string; label: string }[] => {
    const field = approvalFields.find(f => f.fieldKey === fieldKey);
    const fieldType = field?.fieldType || 'text';

    switch (fieldType) {
      case 'number':
      case 'percentage':
        return [
          { value: 'equals', label: '等于' },
          { value: 'not_equals', label: '不等于' },
          { value: 'greater_than', label: '大于' },
          { value: 'less_than', label: '小于' },
          { value: 'greater_than_or_equal', label: '大于等于' },
          { value: 'less_than_or_equal', label: '小于等于' },
        ];
      case 'boolean':
        return [{ value: 'equals', label: '等于' }];
      default:
        return [
          { value: 'equals', label: '等于' },
          { value: 'not_equals', label: '不等于' },
          { value: 'contains', label: '包含' },
          { value: 'not_contains', label: '不包含' },
        ];
    }
  };

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '', value: '' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (index: number, key: keyof Condition, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [key]: value };
    if (key === 'field') {
      updated[index].operator = '';
      updated[index].value = '';
    }
    setConditions(updated);
  };

  const addAction = () => {
    setActions([...actions, { type: 'show_message', target: '', message: '' }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index: number, key: keyof Action, value: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [key]: value };
    setActions(updated);
  };

  const handleSave = () => {
    addAutoApprovalRule({ ...formData, id: 'ar-' + Date.now(), createdAt: new Date().toISOString(), status: 'active' } as any);
    router.push('/approval/auto-rules');
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部导航 */}
        <div>
          <div className="flex items-center text-sm text-[#999999] mb-4">
            <Link href="/" className="hover:text-[#2D3BFF]">首页</Link>
            <span className="mx-2">/</span>
            <Link href="/approval/auto-rules" className="hover:text-[#2D3BFF]">自动审批规则</Link>
            <span className="mx-2">/</span>
            <span className="text-[#0A0A0A]">新增规则</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">新增自动审批规则</h1>
              <p className="text-[#5A5A5A] mt-1">配置自动审批规则，当条件满足时自动执行对应动作</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/approval/auto-rules')}
                className="px-5 py-2.5 text-sm text-[#5A5A5A] border border-[#E5E7EB] rounded-xl hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 text-sm text-white rounded-xl bg-[#2D3BFF] hover:bg-[#4338CA] transition-colors"
              >
                保存规则
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧 - 基本信息、触发条件、自动动作 */}
          <div className="col-span-7 space-y-5">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">基本信息</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">审批点 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={approvalPoint}
                    onChange={(e) => setApprovalPoint(e.target.value)}
                    placeholder="如：业务量、KPI时效考核要求"
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 placeholder:text-[#999999]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">规则名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入规则名称"
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 placeholder:text-[#999999]/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">服务产品 <span className="text-red-500">*</span></label>
                <SearchableSelect
                  value={serviceProduct}
                  onChange={(value) => setServiceProduct(value)}
                  options={serviceProductOptions.map(p => ({ value: p, label: p }))}
                  placeholder="请选择服务产品"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">规则说明 <span className="text-red-500">*</span></label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="描述此规则的用途和触发场景..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 resize-none placeholder:text-[#999999]/40"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[#5A5A5A]">状态</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStatus('active')}
                      className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${status === 'active' ? 'bg-[#2D3BFF] text-white' : 'bg-[#F5F5F5] text-[#5A5A5A]'}`}
                    >
                      启用
                    </button>
                    <button
                      onClick={() => setStatus('inactive')}
                      className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${status === 'inactive' ? 'bg-[#999999] text-white' : 'bg-[#F5F5F5] text-[#5A5A5A]'}`}
                    >
                      禁用
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 触发条件 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
                <h3 className="text-sm font-semibold text-[#0A0A0A]">触发条件</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#5A5A5A]">条件逻辑：</span>
                  <SearchableSelect
                    value={conditionLogic}
                    onChange={(value) => setConditionLogic(value as 'AND' | 'OR')}
                    options={[{ value: 'AND', label: '全部满足 (AND)' }, { value: 'OR', label: '任一满足 (OR)' }]}
                    placeholder="选择条件逻辑"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {index > 0 && (
                      <span className="text-sm font-medium text-[#EA580C] px-2 py-1 bg-[#FFF7ED] rounded-lg">{conditionLogic}</span>
                    )}
                    <SearchableSelect
                      value={condition.field}
                      onChange={(value) => updateCondition(index, 'field', value)}
                      options={fieldOptions}
                      placeholder="选择字段"
                      className="flex-1"
                    />
                    <SearchableSelect
                      value={condition.operator}
                      onChange={(value) => updateCondition(index, 'operator', value)}
                      options={getOperators(condition.field)}
                      placeholder="操作符"
                      className="w-28"
                    />
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      placeholder="值"
                      className="w-32 px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 placeholder:text-[#999999]/40"
                    />
                    <button
                      onClick={() => removeCondition(index)}
                      className="p-2 rounded-lg hover:bg-red-50 text-[#999999] hover:text-red-500 transition-colors"
                      disabled={conditions.length <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addCondition}
                className="text-sm text-[#2D3BFF] hover:text-[#0024B8] inline-flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                添加条件
              </button>
            </div>

            {/* 自动动作 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">自动动作</h3>
              <div className="space-y-4">
                {actions.map((action, index) => (
                  <div key={index} className="p-4 bg-[#F5F5F5] rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <SearchableSelect
                        value={action.type}
                        onChange={(value) => updateAction(index, 'type', value)}
                        options={actionTypes.map(t => ({ value: t.value, label: t.label }))}
                        placeholder="选择动作类型"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeAction(index)}
                        className="p-2 rounded-lg hover:bg-red-50 text-[#999999] hover:text-red-500 transition-colors"
                        disabled={actions.length <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    {(action.type === 'add_approver') && (
                      <div>
                        <label className="block text-sm text-[#5A5A5A] mb-1.5">审批人姓名</label>
                        <input
                          type="text"
                          value={action.target || ''}
                          onChange={(e) => updateAction(index, 'target', e.target.value)}
                          placeholder="如：白沥"
                          className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 placeholder:text-[#999999]/40"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-[#5A5A5A] mb-1.5">提示信息</label>
                      <input
                        type="text"
                        value={action.message || ''}
                        onChange={(e) => updateAction(index, 'message', e.target.value)}
                        placeholder="满足条件时显示的提示信息"
                        className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 placeholder:text-[#999999]/40"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addAction}
                className="text-sm text-[#2D3BFF] hover:text-[#0024B8] inline-flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                添加动作
              </button>
            </div>
          </div>

          {/* 右侧 - 规则说明与预览 */}
          <div className="col-span-5 space-y-5">
            {/* 规则说明 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">规则说明</h3>
              <div className="text-sm text-[#5A5A5A] space-y-3">
                <p>自动审批规则会在审批提交时自动执行，根据配置的条件判断是否触发对应的动作。</p>
                <div>
                  <p className="font-medium text-[#0A0A0A] mb-1">条件逻辑：</p>
                  <ul className="list-disc list-inside space-y-1 text-[#5A5A5A]">
                    <li>AND：所有条件必须同时满足</li>
                    <li>OR：任一条件满足即触发</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[#0A0A0A] mb-1">动作类型：</p>
                  <ul className="list-disc list-inside space-y-1 text-[#5A5A5A]">
                    <li>自动通过：满足条件时标记为通过</li>
                    <li>自动拒绝：满足条件时标记为拒绝</li>
                    <li>添加审批人：自动在审批流程中追加指定审批人</li>
                    <li>显示提示：展示风险评估提示信息（含原因）</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 实时预览 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">规则预览</h3>
              {conditions.some(c => c.field) || actions.some(a => a.type) ? (
                <div className="space-y-4">
                  {approvalPoint && (
                    <div className="text-sm text-[#0A0A0A] font-medium">
                      审批点：<span className="text-[#2D3BFF]">{approvalPoint}</span>
                    </div>
                  )}
                  {conditions.some(c => c.field) && (
                    <div className="p-4 bg-[#F5F5F5] rounded-xl">
                      <p className="text-sm text-[#999999] mb-2">当</p>
                      <div className="space-y-2">
                        {conditions.filter(c => c.field).map((c, i, arr) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-[#E8F4FF] text-[#2D3BFF] rounded-lg">{c.field}</span>
                            <span className="text-[#5A5A5A]">{c.operator}</span>
                            <span className="px-2 py-1 bg-white rounded-lg font-medium text-[#0A0A0A]">{c.value || '?'}</span>
                            {i < arr.length - 1 && <span className="text-[#EA580C] font-medium ml-1">{conditionLogic}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  </div>
                  {actions.some(a => a.type) && (
                    <div className="p-4 bg-[#F5F5F5] rounded-xl">
                      <p className="text-sm text-[#999999] mb-2">则执行</p>
                      <div className="space-y-2">
                        {actions.filter(a => a.type).map((a, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {a.type === 'auto_approve' && <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>}
                            {a.type === 'auto_reject' && <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>}
                            {a.type === 'add_approver' && <span className="w-2 h-2 rounded-full bg-[#2D3BFF]"></span>}
                            {a.type === 'show_message' && <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>}
                            <span className="font-medium text-[#0A0A0A]">{actionTypes.find(t => t.value === a.type)?.label}</span>
                            {a.target && <span className="text-[#5A5A5A]">: {a.target}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(actions.some(a => a.message)) && (
                    <div className="p-3 bg-[#E8F4FF] border border-[#2D3BFF]/10 rounded-xl">
                      <p className="text-sm text-[#2D3BFF]">
                        <span className="font-medium">提示：</span>{actions.find(a => a.message)?.message}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#999999] text-center py-8">请配置条件和动作以预览规则效果</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
