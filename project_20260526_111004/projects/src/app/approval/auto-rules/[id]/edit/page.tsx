'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const serviceProductOptions = ['货代', '关务', '仓储', '运输', '进出口', '维修', '合同物流', '其他'];


const actionTypes = [
  { value: 'auto_approve', label: '自动通过', description: '满足条件时标记为通过' },
  { value: 'auto_reject', label: '自动拒绝', description: '满足条件时标记为拒绝' },
  { value: 'add_approver', label: '添加审批人', description: '自动在审批流程中追加指定审批人' },
  { value: 'show_message', label: '显示提示', description: '展示风险评估提示信息（含原因）' },
];

interface Condition { field: string; operator: string; value: string; }
interface Action { type: string; target: string; message: string; }

interface MockRule {
  id: string;
  approvalPoint: string;
  name: string;
  serviceProduct: string;
  status: 'active' | 'inactive';
  remark: string;
  conditionLogic: 'AND' | 'OR';
  conditions: Condition[];
  actions: Action[];
}



export default function AutoRuleEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { autoApprovalRules, updateAutoApprovalRule, deleteAutoApprovalRule, approvalFields } = useApp();
  const rule = autoApprovalRules.find((r: any) => r.id === id) || autoApprovalRules[0];

  const fieldOptions = useMemo(() => {
    return approvalFields.filter(f => f.status === 'active').map(f => ({ value: f.fieldKey, label: f.name }));
  }, [approvalFields]);

  const getOperators = (fieldKey: string): { value: string; label: string }[] => {
    const field = approvalFields.find(f => f.fieldKey === fieldKey);
    const fieldType = field?.fieldType || 'text';
    switch (fieldType) {
      case 'number':
      case 'percentage':
        return [
          { value: 'equals', label: '等于' }, { value: 'not_equals', label: '不等于' },
          { value: 'greater_than', label: '大于' }, { value: 'less_than', label: '小于' },
          { value: 'greater_than_or_equal', label: '大于等于' }, { value: 'less_than_or_equal', label: '小于等于' },
        ];
      case 'boolean':
        return [{ value: 'equals', label: '等于' }];
      default:
        return [
          { value: 'equals', label: '等于' }, { value: 'not_equals', label: '不等于' },
          { value: 'contains', label: '包含' }, { value: 'not_contains', label: '不包含' },
        ];
    }
  };

  const [formData, setFormData] = useState({
    approvalPoint: '',
    name: '',
    serviceProduct: '',
    status: 'active' as 'active' | 'inactive',
    remark: '',
    conditionLogic: 'AND' as 'AND' | 'OR',
  });
  const [conditions, setConditions] = useState<Condition[]>([{ field: '', operator: '', value: '' }]);
  const [actions, setActions] = useState<Action[]>([{ type: '', target: '', message: '' }]);

  useEffect(() => {
    setFormData({
      approvalPoint: (rule as any).approvalPoint || '',
      name: rule.name,
      serviceProduct: rule.serviceProduct || '',
      status: rule.status as any,
      remark: rule.remark || '',
      conditionLogic: (rule.conditionLogic as 'AND' | 'OR') || 'AND',
    });
    setConditions(rule.conditions.length > 0 ? rule.conditions as any : [{ field: '', operator: '', value: '' }]);
    setActions((rule.actions.length > 0 ? rule.actions : [{ type: '', target: '', message: '' }]) as any);
  }, [id]);

  const addCondition = () => setConditions([...conditions, { field: '', operator: '', value: '' }]);
  const removeCondition = (index: number) => { if (conditions.length > 1) setConditions(conditions.filter((_, i) => i !== index)); };
  const updateCondition = (index: number, key: keyof Condition, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [key]: value };
    if (key === 'field') { updated[index].operator = ''; updated[index].value = ''; }
    setConditions(updated);
  };

  const addAction = () => setActions([...actions, { type: '', target: '', message: '' }]);
  const removeAction = (index: number) => { if (actions.length > 1) setActions(actions.filter((_, i) => i !== index)); };
  const updateAction = (index: number, key: keyof Action, value: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [key]: value };
    setActions(updated);
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
            <span className="text-[#0A0A0A]">编辑规则</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">编辑自动审批规则</h1>
              <p className="text-[#5A5A5A] mt-1">修改自动审批规则的配置信息</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/approval/auto-rules')}
                className="px-5 py-2.5 text-sm text-[#5A5A5A] border border-[#E5E7EB] rounded-xl hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => { updateAutoApprovalRule(id, formData as any); router.push('/approval/auto-rules'); }}
                className="px-5 py-2.5 text-sm text-white rounded-xl bg-[#2D3BFF] hover:bg-[#4338CA] transition-colors"
              >
                保存规则
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧 */}
          <div className="col-span-7 space-y-5">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">基本信息</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">审批点 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.approvalPoint}
                    onChange={e => setFormData({ ...formData, approvalPoint: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                    placeholder="请输入审批点"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">规则名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                    placeholder="请输入规则名称"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">服务产品</label>
                <select
                  value={formData.serviceProduct}
                  onChange={e => setFormData({ ...formData, serviceProduct: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                >
                  <option value="">请选择服务产品</option>
                  {serviceProductOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">规则说明</label>
                <textarea
                  value={formData.remark}
                  onChange={e => setFormData({ ...formData, remark: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none"
                  placeholder="请输入规则说明"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-[#5A5A5A]">状态</label>
                <button
                  onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${formData.status === 'active' ? 'bg-[#2D3BFF]' : 'bg-[#D1D5DB]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.status === 'active' ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-[#5A5A5A]">{formData.status === 'active' ? '启用' : '禁用'}</span>
              </div>
            </div>

            {/* 触发条件 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
                <h3 className="text-sm font-semibold text-[#0A0A0A]">触发条件</h3>
                <select
                  value={formData.conditionLogic}
                  onChange={e => setFormData({ ...formData, conditionLogic: e.target.value as 'AND' | 'OR' })}
                  className="px-3 py-1.5 bg-[#FFF7ED] text-[#EA580C] text-sm font-medium rounded-lg border-none focus:outline-none"
                >
                  <option value="AND">全部满足 (AND)</option>
                  <option value="OR">任一满足 (OR)</option>
                </select>
              </div>
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {index > 0 && (
                      <span className="text-sm font-medium text-[#EA580C] px-2 py-1 bg-[#FFF7ED] rounded-lg min-w-[36px] text-center">{formData.conditionLogic}</span>
                    )}
                    <select
                      value={condition.field}
                      onChange={e => updateCondition(index, 'field', e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                    >
                      <option value="">选择字段</option>
                      {fieldOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <select
                      value={condition.operator}
                      onChange={e => updateCondition(index, 'operator', e.target.value)}
                      className="w-28 px-3 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#5A5A5A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                    >
                      <option value="">操作符</option>
                      {getOperators(condition.field).map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={e => updateCondition(index, 'value', e.target.value)}
                      className="w-32 px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                      placeholder="值"
                    />
                    {conditions.length > 1 && (
                      <button onClick={() => removeCondition(index)} className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addCondition} className="flex items-center gap-2 text-sm text-[#2D3BFF] hover:text-[#0024B8] font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
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
                      <select
                        value={action.type}
                        onChange={e => updateAction(index, 'type', e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                      >
                        <option value="">选择动作类型</option>
                        {actionTypes.map(t => <option key={t.value} value={t.value}>{t.label} - {t.description}</option>)}
                      </select>
                      {actions.length > 1 && (
                        <button onClick={() => removeAction(index)} className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    {action.type === 'add_approver' && (
                      <input
                        type="text"
                        value={action.target}
                        onChange={e => updateAction(index, 'target', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                        placeholder="审批人姓名"
                      />
                    )}
                    <input
                      type="text"
                      value={action.message}
                      onChange={e => updateAction(index, 'message', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                      placeholder="提示消息（可选）"
                    />
                  </div>
                ))}
              </div>
              <button onClick={addAction} className="flex items-center gap-2 text-sm text-[#2D3BFF] hover:text-[#0024B8] font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                添加动作
              </button>
            </div>

          </div>

          {/* 右侧 - 规则预览 */}
          <div className="col-span-5 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">规则预览</h3>
              <div className="space-y-4">
                {formData.approvalPoint && (
                  <div className="text-sm text-[#0A0A0A] font-medium">
                    审批点：<span className="text-[#2D3BFF]">{formData.approvalPoint}</span>
                  </div>
                )}
                <div className="p-4 bg-[#F5F5F5] rounded-xl">
                  <p className="text-sm text-[#999999] mb-2">当</p>
                  <div className="space-y-2">
                    {conditions.filter(c => c.field).map((c, i, arr) => (
                      <div key={i} className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="px-2 py-1 bg-[#E8F4FF] text-[#2D3BFF] rounded-lg">{c.field}</span>
                        <span className="text-[#5A5A5A]">{c.operator}</span>
                        <span className="px-2 py-1 bg-white rounded-lg font-medium text-[#0A0A0A]">{c.value}</span>
                        {i < arr.length - 1 && <span className="text-[#EA580C] font-medium ml-1">{formData.conditionLogic}</span>}
                      </div>
                    ))}
                    {conditions.every(c => !c.field) && <p className="text-sm text-[#999999]">请添加触发条件</p>}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
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
                    {actions.every(a => !a.type) && <p className="text-sm text-[#999999]">请添加执行动作</p>}
                  </div>
                </div>
                {actions.some(a => a.message) && (
                  <div className="p-3 bg-[#E8F4FF] border border-[#2D3BFF]/10 rounded-xl">
                    <p className="text-sm text-[#2D3BFF]">
                      <span className="font-medium">提示：</span>{actions.find(a => a.message)?.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
