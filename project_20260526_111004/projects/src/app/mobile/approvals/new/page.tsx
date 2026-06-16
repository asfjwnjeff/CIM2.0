'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApp, evaluateApprovalRules } from '@/lib/store';
import type { RiskApproval, ApprovalField, ServiceProduct } from '@/lib/types';
import MobileFormSection from '@/components/mobile/MobileFormSection';
import MobileDynamicFields from '@/components/mobile/MobileDynamicFields';
import ApprovalReportMini from '@/components/mobile/ApprovalReportMini';
import MobileSelectSheet from '@/components/mobile/MobileSelectSheet';
import { Field } from '@/components/mobile/SharedComponents';

// ====== PRD §5.6 严格对齐的枚举（与桌面端完全一致） ======
const SERVICE_PRODUCTS = ['货代', '关务', '仓库', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他'];
const BUSINESS_TYPES = ['保税', '口岸完税', '免税', '试单', '其他'];
const MONTHLY_ORDER_OPTIONS = ['0-5单', '6-10单', '11-20单', '21-50单', '50单以上'];
const MONTHLY_INVOICE_OPTIONS = ['0-5000元', '5001-20000元', '20001-100000元', '100000元以上'];
const CUSTOM_SERVICE_OPTIONS = ['信息系统', '运输', '仓储', '财务', '仅涉及标准服务内容'];
const CONTRACT_LOGISTICS_APPROVERS = ['张洁', '蒋总', '吴总', '朱弢'];

// Mock 数据（与桌面端一致）
const MOCK_CUSTOMERS = [
  { id: 'bc1', name: '应用材料(中国)有限公司' },
  { id: 'bc2', name: '飞雅贸易(上海)有限公司' },
  { id: 'bc3', name: '荏原机械(中国)有限公司' },
  { id: 'bc4', name: '昇先创国际贸易(上海)有限公司' },
  { id: 'bc5', name: '上海华力集成电路制造有限公司' },
  { id: 'bc6', name: '苏斯贸易(上海)有限公司' },
  { id: 'bc7', name: '武汉光库科技有限公司' },
  { id: 'bc8', name: '江苏鑫华半导体科技股份有限公司' },
];
const MOCK_OPPORTUNITIES = [
  { id: 'opp1', title: '应用材料-货代服务', customer: '应用材料(中国)有限公司', serviceProduct: '货代' },
  { id: 'opp2', title: '飞雅贸易-仓储服务', customer: '飞雅贸易(上海)有限公司', serviceProduct: '仓库' },
  { id: 'opp3', title: '荏原机械-运输服务', customer: '荏原机械(中国)有限公司', serviceProduct: '运输' },
  { id: 'opp4', title: '昇先创-进出口服务', customer: '昇先创国际贸易(上海)有限公司', serviceProduct: '进出口' },
  { id: 'opp5', title: '上海华力-合同物流', customer: '上海华力集成电路制造有限公司', serviceProduct: '合同物流' },
];
const MOCK_INVOICES = [
  { id: 'inv1', label: '8635 - 应用材料(中国)有限公司', subtitle: '税号: 91310000607239088X' },
  { id: 'inv2', label: '8639 - 飞雅贸易(上海)有限公司', subtitle: '税号: 91310000607239089Y' },
  { id: 'inv3', label: '8641 - 荏原机械(中国)有限公司', subtitle: '税号: 91310000607239090Z' },
];

export default function MobileNewApprovalPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const { addRiskApproval, currentUser, approvalFields, autoApprovalRules } = useApp();
  const [saving, setSaving] = useState(false);

  // Sheet 状态
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [opportunitySheetOpen, setOpportunitySheetOpen] = useState(false);
  const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);

  // 表单状态
  const [form, setForm] = useState({
    companyName: '',
    englishName: '',
    parentCompany: '',
    subsidiaryCompany: '',
    serviceProduct: '货代',
    businessCustomerIds: [] as string[],
    opportunityId: '',
    invoiceInfoIds: [] as string[],
    settlementPeriod: '',
    contactName: '',
    isTradeAgent: '否',
    businessType: '保税',
    goodsType: '',
    monthlyOrders: '',
    monthlyInvoiceAmount: '',
    customsKpi: '',
    transportKpi: '',
    warehouseRequirement: '',
    customServiceRequirement: '',
    customRequirementDescription: '',
    pickedApprover: '',  // 合同物流四选一
  });

  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const updateField = useCallback((field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = new Set(prev); next.delete(field); return next; });
  }, []);

  // 合规审核字段（严格对齐桌面端过滤逻辑）
  const relevantFields = useMemo(() => {
    return approvalFields.filter(
      (f) => f.status === 'active' && (f.serviceProducts as string[])?.includes(form.serviceProduct)
    );
  }, [approvalFields, form.serviceProduct]);

  // 实时审批辅助报告
  const reportData = useMemo(() => {
    if (!form.companyName) return null;
    const fieldValues: Record<string, string> = {
      company_name: form.companyName,
      service_product: form.serviceProduct,
      is_trade_agent: form.isTradeAgent,
      business_type: form.businessType,
      goods_type: form.goodsType,
      monthly_orders: form.monthlyOrders,
      monthly_invoice_amount: form.monthlyInvoiceAmount,
    };
    const results = evaluateApprovalRules(fieldValues, autoApprovalRules, approvalFields, form.serviceProduct);
    const items = Array.from(results.values());
    return { items, passCount: items.filter((r) => r.result === 'pass').length, warnCount: items.filter((r) => r.result === 'warn').length };
  }, [form, autoApprovalRules, approvalFields]);

  // 选中的客户/商机/开票信息详情
  const selectedCustomerLabels = form.businessCustomerIds.map((id) => MOCK_CUSTOMERS.find((c) => c.id === id)?.name || id);
  const selectedOpportunity = MOCK_OPPORTUNITIES.find((o) => o.id === form.opportunityId);
  const selectedInvoiceLabels = form.invoiceInfoIds.map((id) => MOCK_INVOICES.find((i) => i.id === id)?.label || id);

  // 表单校验
  const requiredFields: { field: string; label: string }[] = [
    { field: 'companyName', label: '公司全称' },
    { field: 'serviceProduct', label: '服务产品' },
    { field: 'settlementPeriod', label: '结算账期' },
    { field: 'contactName', label: '联系人' },
    { field: 'isTradeAgent', label: '是否涉及贸易代理' },
    { field: 'businessType', label: '业务类型' },
    { field: 'goodsType', label: '货物类型' },
    { field: 'monthlyOrders', label: '月均订单数' },
    { field: 'monthlyInvoiceAmount', label: '月均开票额' },
    { field: 'customsKpi', label: '通关KPI要求' },
    { field: 'transportKpi', label: '运输KPI要求' },
    { field: 'warehouseRequirement', label: '仓库租赁要求' },
    { field: 'customServiceRequirement', label: '定制化服务需求' },
    { field: 'customRequirementDescription', label: '定制化需求描述' },
  ];

  const validate = (): boolean => {
    const newErrors = new Set<string>();
    for (const { field, label } of requiredFields) {
      const val = (form as Record<string, unknown>)[field];
      if (!val || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
        newErrors.add(field);
      }
    }
    // 合规审核必填字段
    for (const af of relevantFields) {
      if (af.isRequired && !dynamicValues[af.fieldKey]) {
        newErrors.add(`dynamic_${af.fieldKey}`);
      }
    }
    setErrors(newErrors);
    if (newErrors.size > 0) {
      toast.error(`请填写 ${newErrors.size} 个必填项`);
      // 滚动到第一个错误
      const firstError = formRef.current?.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const buildApprovalSteps = (draft: boolean) => {
    const isTradeAgent = form.isTradeAgent === '是';
    const isContractLogistics = form.serviceProduct === '合同物流';
    const functionalApprover = isContractLogistics && form.pickedApprover
      ? form.pickedApprover
      : getFunctionalApprover(form.serviceProduct);

    const nodes = [
      { id: 'init', name: '发起审批', role: '申请人', status: draft ? 'current' : 'completed' as const, approver: currentUser.name, level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: draft ? 'pending' as const : 'current' as const, approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批人审批', role: '职能审批人', status: 'pending' as const, approver: functionalApprover, level: 3 },
      { id: 'fin', name: '财务+中心总经理会签', role: '财务+总经理', status: 'pending' as const, approver: '', level: 4, isCountersign: true },
      { id: 'gm', name: '总经理审批', role: '总经理', status: 'pending' as const, approver: '赵总', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending' as const, approver: '李工', level: 6 },
    ];

    // 贸易代理追加白沥
    if (isTradeAgent) {
      nodes.splice(3, 0, { id: 'trade_agent', name: '贸易代理审批(追加)', role: '贸易代理', status: 'pending' as const, approver: '白沥', level: 3.5 });
    }

    return nodes;
  };

  const handleSubmit = async (draft: boolean) => {
    if (!validate()) return;
    setSaving(true);

    try {
      const now = new Date().toISOString();
      const newApproval: Omit<RiskApproval, 'id' | 'createdAt'> = {
        companyName: form.companyName,
        englishName: form.englishName || undefined,
        parentCompany: form.parentCompany || undefined,
        subsidiaryCompany: form.subsidiaryCompany || undefined,
        serviceProduct: form.serviceProduct,
        isTradeAgent: form.isTradeAgent,
        businessType: form.businessType,
        goodsType: form.goodsType,
        monthlyBusinessVolume: form.monthlyOrders,
        monthlyInvoiceAmount: form.monthlyInvoiceAmount,
        customsKpiRequirement: form.customsKpi || undefined,
        transportKpiRequirement: form.transportKpi || undefined,
        warehouseLeaseRequirement: form.warehouseRequirement || undefined,
        customServiceRequirement: form.customServiceRequirement || undefined,
        customRequirementDescription: form.customRequirementDescription || undefined,
        settlementPeriod: form.settlementPeriod,
        contactName: form.contactName,
        businessCustomerIds: form.businessCustomerIds.length > 0 ? form.businessCustomerIds : undefined,
        opportunityId: form.opportunityId || undefined,
        invoiceInfoIds: form.invoiceInfoIds.length > 0 ? form.invoiceInfoIds : undefined,
        pickedApprover: form.pickedApprover || undefined,
        approvalSteps: buildApprovalSteps(draft),
        dynamicFieldValues: Object.keys(dynamicValues).length > 0 ? dynamicValues : undefined,
        status: draft ? 'draft' : 'in_review',
        approvalStatus: draft ? '草稿' : '审批中',
        updatedAt: now,
        submitTime: draft ? undefined : now,
        history: draft ? [] : [{
          id: `hist-${Date.now()}`, approvalId: '', action: 'submitted' as const,
          operator: currentUser.id, operatorName: currentUser.name, timestamp: now,
        }],
      };

      addRiskApproval(newApproval);
      toast.success(draft ? '草稿已保存' : '审批已提交');
      router.push('/mobile/approvals');
    } catch (e) {
      console.error('[新建审批] 提交失败:', e);
      toast.error('提交失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-[calc(120px+var(--mobile-tab-height))]" ref={formRef}>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#EBEBEB] text-[#5A5A5A] active:bg-[#F5F5F5]" onClick={() => router.back()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-[#0A0A0A]">新建审批</h1>
      </div>

      {/* ====== 公司信息 ====== */}
      <MobileFormSection title="公司信息" defaultExpanded>
        <Field label="公司全称" required error={errors.has('companyName')}>
          <input className="mobile-input" placeholder="输入公司全称" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} />
        </Field>
      </MobileFormSection>

      {/* ====== 关联信息（含新增3字段） ====== */}
      <MobileFormSection title="关联信息" defaultExpanded>
        {/* 业务主客户 — MobileSelectSheet 多选 */}
        <Field label="业务主客户" required>
          <button type="button" className="mobile-input text-left flex items-center justify-between" onClick={() => setCustomerSheetOpen(true)}>
            <span className={selectedCustomerLabels.length > 0 ? 'text-[#0A0A0A]' : 'text-[#999999]'}>
              {selectedCustomerLabels.length > 0 ? selectedCustomerLabels.join('、') : '选择客户'}
            </span>
            <span className="text-xs text-[#2D3BFF] font-medium">{selectedCustomerLabels.length > 0 ? selectedCustomerLabels.length : '选择'}</span>
          </button>
          {selectedCustomerLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {selectedCustomerLabels.map((name) => (
                <span key={name} className="text-xs px-2 py-1 bg-[#E8EBFF] text-[#2D3BFF] rounded-full">{name}</span>
              ))}
            </div>
          )}
        </Field>

        {/* 商机 */}
        <Field label="商机" required error={errors.has('opportunityId')}>
          <button type="button" className="mobile-input text-left" onClick={() => setOpportunitySheetOpen(true)}>
            <span className={selectedOpportunity ? 'text-[#0A0A0A]' : 'text-[#999999]'}>
              {selectedOpportunity ? `${selectedOpportunity.title} · ${selectedOpportunity.customer}` : '选择商机'}
            </span>
          </button>
        </Field>

        {/* 客户开票信息 */}
        <Field label="客户开票信息" required>
          <button type="button" className="mobile-input text-left flex items-center justify-between" onClick={() => setInvoiceSheetOpen(true)}>
            <span className={selectedInvoiceLabels.length > 0 ? 'text-[#0A0A0A] text-xs truncate' : 'text-[#999999]'}>
              {selectedInvoiceLabels.length > 0 ? selectedInvoiceLabels.join('、') : '选择开票信息'}
            </span>
            <span className="text-xs text-[#2D3BFF] font-medium shrink-0 ml-2">{selectedInvoiceLabels.length > 0 ? selectedInvoiceLabels.length : '选择'}</span>
          </button>
        </Field>

        <Field label="结算账期" required error={errors.has('settlementPeriod')}>
          <input className="mobile-input" placeholder="如：月结30天" value={form.settlementPeriod} onChange={(e) => updateField('settlementPeriod', e.target.value)} />
        </Field>
        <Field label="联系人" required error={errors.has('contactName')}>
          <input className="mobile-input" placeholder="输入联系人姓名" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} />
        </Field>
      </MobileFormSection>

      {/* ====== 业务信息（含原折叠区的KPI字段，全部在主区域且必填） ====== */}
      <MobileFormSection title="业务信息" defaultExpanded>
        <Field label="服务产品" required>
          <select className="mobile-input" value={form.serviceProduct} onChange={(e) => updateField('serviceProduct', e.target.value)}>
            {SERVICE_PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        {/* 合同物流 → 四选一 */}
        {form.serviceProduct === '合同物流' && (
          <Field label="职能审批人（四选一）" required error={errors.has('pickedApprover')}>
            <select className="mobile-input" value={form.pickedApprover} onChange={(e) => updateField('pickedApprover', e.target.value)}>
              <option value="">请选择审批人</option>
              {CONTRACT_LOGISTICS_APPROVERS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
        )}

        <Field label="是否涉及贸易代理" required>
          <select className="mobile-input" value={form.isTradeAgent} onChange={(e) => updateField('isTradeAgent', e.target.value)}>
            <option value="否">否</option><option value="是">是</option>
          </select>
        </Field>
        {form.isTradeAgent === '是' && (
          <div className="text-sm text-[#E8850C] bg-[#FFF4E8] border border-[#FFD699] px-3 py-2.5 rounded-lg font-medium">
            ⚠️ 涉及贸易代理，审批链将自动追加审批人「白沥」
          </div>
        )}
        <Field label="业务类型" required error={errors.has('businessType')}>
          <select className="mobile-input" value={form.businessType} onChange={(e) => updateField('businessType', e.target.value)}>
            {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="货物类型" required error={errors.has('goodsType')}>
          <input className="mobile-input" placeholder="如：半导体设备" value={form.goodsType} onChange={(e) => updateField('goodsType', e.target.value)} />
        </Field>
        <Field label="月均订单数" required error={errors.has('monthlyOrders')}>
          <select className="mobile-input" value={form.monthlyOrders} onChange={(e) => updateField('monthlyOrders', e.target.value)}>
            <option value="">请选择</option>
            {MONTHLY_ORDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="月均开票额" required error={errors.has('monthlyInvoiceAmount')}>
          <select className="mobile-input" value={form.monthlyInvoiceAmount} onChange={(e) => updateField('monthlyInvoiceAmount', e.target.value)}>
            <option value="">请选择</option>
            {MONTHLY_INVOICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="通关KPI要求" required error={errors.has('customsKpi')}>
          <textarea className="mobile-textarea" rows={3} placeholder="通关时效要求等" value={form.customsKpi} onChange={(e) => updateField('customsKpi', e.target.value)} />
        </Field>
        <Field label="运输KPI要求" required error={errors.has('transportKpi')}>
          <textarea className="mobile-textarea" rows={3} placeholder="运输时效要求等" value={form.transportKpi} onChange={(e) => updateField('transportKpi', e.target.value)} />
        </Field>
        <Field label="仓库租赁要求" required error={errors.has('warehouseRequirement')}>
          <textarea className="mobile-textarea" rows={3} placeholder="面积/位置/条件等" value={form.warehouseRequirement} onChange={(e) => updateField('warehouseRequirement', e.target.value)} />
        </Field>
        <Field label="定制化服务需求" required error={errors.has('customServiceRequirement')}>
          <select className="mobile-input" value={form.customServiceRequirement} onChange={(e) => updateField('customServiceRequirement', e.target.value)}>
            <option value="">请选择</option>
            {CUSTOM_SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="定制化需求描述" required error={errors.has('customRequirementDescription')}>
          <textarea className="mobile-textarea" rows={4} placeholder="详细描述定制化需求" value={form.customRequirementDescription} onChange={(e) => updateField('customRequirementDescription', e.target.value)} />
        </Field>
      </MobileFormSection>

      {/* ====== 公司信息补充（可选，折叠） ====== */}
      <MobileFormSection title="公司信息补充" subtitle="可选" defaultExpanded={false}>
        <Field label="英文名称"><input className="mobile-input" placeholder="境外客户必填" value={form.englishName} onChange={(e) => updateField('englishName', e.target.value)} /></Field>
        <Field label="集团（母）公司名称"><input className="mobile-input" placeholder="输入集团母公司名称" value={form.parentCompany} onChange={(e) => updateField('parentCompany', e.target.value)} /></Field>
        <Field label="分（子）公司名称"><input className="mobile-input" placeholder="输入分/子公司名称" value={form.subsidiaryCompany} onChange={(e) => updateField('subsidiaryCompany', e.target.value)} /></Field>
      </MobileFormSection>

      {/* ====== 合规审核（动态字段） ====== */}
      {relevantFields.length > 0 && (
        <MobileFormSection title={`合规审核 · ${form.serviceProduct}`} defaultExpanded>
          <MobileDynamicFields fields={relevantFields} values={dynamicValues} onChange={(fieldKey, value) => { setDynamicValues((prev) => ({ ...prev, [fieldKey]: value })); setErrors((prev) => { const n = new Set(prev); n.delete(`dynamic_${fieldKey}`); return n; }); }} />
        </MobileFormSection>
      )}

      {/* ====== 辅助报告 ====== */}
      {reportData && reportData.items.length > 0 && (
        <MobileFormSection title="审批辅助报告" subtitle={`${reportData.passCount}通过 · ${reportData.warnCount}风险`} defaultExpanded={reportData.warnCount > 0}>
          <ApprovalReportMini customerName={form.companyName} serviceProduct={form.serviceProduct} generatedAt={new Date().toISOString()} items={reportData.items} passCount={reportData.passCount} warnCount={reportData.warnCount} />
        </MobileFormSection>
      )}

      {/* ====== Sheet 弹窗 ====== */}
      <MobileSelectSheet open={customerSheetOpen} title="选择业务主客户" multiSelect options={MOCK_CUSTOMERS.map((c) => ({ id: c.id, label: c.name }))} selected={form.businessCustomerIds} onConfirm={(ids) => updateField('businessCustomerIds', ids)} onClose={() => setCustomerSheetOpen(false)} />
      <MobileSelectSheet open={opportunitySheetOpen} title="选择商机" multiSelect={false} options={MOCK_OPPORTUNITIES.map((o) => ({ id: o.id, label: o.title, subtitle: `${o.customer} · ${o.serviceProduct}` }))} selected={form.opportunityId ? [form.opportunityId] : []} onConfirm={(ids) => updateField('opportunityId', ids[0] || '')} onClose={() => setOpportunitySheetOpen(false)} />
      <MobileSelectSheet open={invoiceSheetOpen} title="选择客户开票信息" multiSelect options={MOCK_INVOICES.map((i) => ({ id: i.id, label: i.label, subtitle: i.subtitle }))} selected={form.invoiceInfoIds} onConfirm={(ids) => updateField('invoiceInfoIds', ids)} onClose={() => setInvoiceSheetOpen(false)} />

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] px-4 py-3 flex gap-3 z-40"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px) + 56px)' }}>
        <button className="flex-1 h-11 border border-[#EBEBEB] text-[#5A5A5A] rounded-xl text-sm font-semibold active:bg-[#F5F5F5] disabled:opacity-50"
          onClick={() => handleSubmit(true)} disabled={saving}>暂存草稿</button>
        <button className="flex-1 h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA] disabled:opacity-50"
          onClick={() => handleSubmit(false)} disabled={saving}>提交审批</button>
      </div>
    </div>
  );
}

function getFunctionalApprover(sp: string): string {
  const map: Record<string, string> = { '货代': '张洁', '进出口': '张洁', '一体化供应链': '张洁', '其他': '张洁', '关务': '蒋总', '维修': '蒋总', '仓库': '吴总', '运输': '朱弢' };
  return map[sp] || '张洁';
}
