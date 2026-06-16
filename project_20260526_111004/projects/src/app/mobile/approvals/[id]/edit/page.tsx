'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useApp, evaluateApprovalRules } from '@/lib/store';
import type { RiskApproval } from '@/lib/types';
import MobileFormSection from '@/components/mobile/MobileFormSection';
import MobileDynamicFields from '@/components/mobile/MobileDynamicFields';
import ApprovalReportMini from '@/components/mobile/ApprovalReportMini';

const SERVICE_PRODUCTS = ['货代', '关务', '仓库', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他'];
const BUSINESS_TYPES = ['保税', '口岸完税', '免税', '试单', '其他'];
const MONTHLY_ORDER_OPTIONS = ['0-5单', '6-10单', '11-20单', '21-50单', '50单以上'];
const MONTHLY_INVOICE_OPTIONS = ['0-5000元', '5001-20000元', '20001-100000元', '100000元以上'];
const CUSTOM_SERVICE_OPTIONS = ['信息系统', '运输', '仓储', '财务', '仅涉及标准服务内容'];
const CONTRACT_LOGISTICS_APPROVERS = ['张洁', '蒋总', '吴总', '朱弢'];

export default function MobileEditApprovalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { riskApprovals, updateRiskApproval, currentUser, approvalFields, autoApprovalRules } = useApp();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const approval = useMemo(() => riskApprovals.find((a) => a.id === id), [riskApprovals, id]);

  const [form, setForm] = useState({
    companyName: '', englishName: '', parentCompany: '', subsidiaryCompany: '',
    serviceProduct: '货代', settlementPeriod: '', contactName: '',
    isTradeAgent: '否', businessType: '保税', goodsType: '',
    monthlyOrders: '', monthlyInvoiceAmount: '',
    customsKpi: '', transportKpi: '', warehouseRequirement: '',
    customServiceRequirement: '', customRequirementDescription: '',
    pickedApprover: '',
  });
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  // 预填已有数据
  useEffect(() => {
    if (approval) {
      setForm({
        companyName: approval.companyName || '',
        englishName: approval.englishName || '',
        parentCompany: approval.parentCompany || '',
        subsidiaryCompany: approval.subsidiaryCompany || '',
        serviceProduct: approval.serviceProduct || '货代',
        settlementPeriod: approval.settlementPeriod || '',
        contactName: approval.contactName || '',
        isTradeAgent: approval.isTradeAgent || '否',
        businessType: approval.businessType || '保税',
        goodsType: approval.goodsType || '',
        monthlyOrders: approval.monthlyBusinessVolume || '',
        monthlyInvoiceAmount: approval.monthlyInvoiceAmount || '',
        customsKpi: approval.customsKpiRequirement || '',
        transportKpi: approval.transportKpiRequirement || '',
        warehouseRequirement: approval.warehouseLeaseRequirement || '',
        customServiceRequirement: approval.customServiceRequirement || '',
        customRequirementDescription: approval.customRequirementDescription || '',
        pickedApprover: approval.pickedApprover || '',
      });
      if (approval.dynamicFieldValues) setDynamicValues(approval.dynamicFieldValues);
    }
  }, [approval]);

  if (!approval) return <div className="py-20 text-center text-sm text-[#999999]">审批未找到</div>;

  const displayStatus = approval.approvalStatus || approval.status;
  const canEdit = displayStatus === 'draft' || displayStatus === '草稿' || displayStatus === 'rejected' || displayStatus === '已驳回';
  if (!canEdit) return <div className="py-20 text-center text-sm text-[#999999]">当前状态不可编辑</div>;

  const updateField = (f: string, v: string) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((p) => { const n = new Set(p); n.delete(f); return n; });
  };

  const relevantFields = useMemo(() =>
    approvalFields.filter((f) => f.status === 'active' && (f.serviceProducts as string[])?.includes(form.serviceProduct)),
  [approvalFields, form.serviceProduct]);

  const reportData = useMemo(() => {
    if (!form.companyName) return null;
    const fv: Record<string, string> = { company_name: form.companyName, service_product: form.serviceProduct, is_trade_agent: form.isTradeAgent, business_type: form.businessType, goods_type: form.goodsType, monthly_orders: form.monthlyOrders, monthly_invoice_amount: form.monthlyInvoiceAmount };
    const r = evaluateApprovalRules(fv, autoApprovalRules, approvalFields, form.serviceProduct);
    const items = Array.from(r.values());
    return { items, passCount: items.filter((i) => i.result === 'pass').length, warnCount: items.filter((i) => i.result === 'warn').length };
  }, [form, autoApprovalRules, approvalFields]);

  const requiredFields = [
    'companyName', 'serviceProduct', 'settlementPeriod', 'contactName', 'isTradeAgent',
    'businessType', 'goodsType', 'monthlyOrders', 'monthlyInvoiceAmount',
    'customsKpi', 'transportKpi', 'warehouseRequirement', 'customServiceRequirement', 'customRequirementDescription',
  ];

  const validate = () => {
    const ne = new Set<string>();
    for (const f of requiredFields) { if (!(form as Record<string, unknown>)[f]) ne.add(f); }
    for (const af of relevantFields) { if (af.isRequired && !dynamicValues[af.fieldKey]) ne.add(`dynamic_${af.fieldKey}`); }
    setErrors(ne);
    if (ne.size > 0) { toast.error(`请填写 ${ne.size} 个必填项`); return false; }
    return true;
  };

  const handleSave = (draft: boolean) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      updateRiskApproval(id, {
        companyName: form.companyName, englishName: form.englishName || undefined,
        parentCompany: form.parentCompany || undefined, subsidiaryCompany: form.subsidiaryCompany || undefined,
        serviceProduct: form.serviceProduct, isTradeAgent: form.isTradeAgent,
        businessType: form.businessType, goodsType: form.goodsType,
        monthlyBusinessVolume: form.monthlyOrders, monthlyInvoiceAmount: form.monthlyInvoiceAmount,
        customsKpiRequirement: form.customsKpi || undefined,
        transportKpiRequirement: form.transportKpi || undefined,
        warehouseLeaseRequirement: form.warehouseRequirement || undefined,
        customServiceRequirement: form.customServiceRequirement || undefined,
        customRequirementDescription: form.customRequirementDescription || undefined,
        settlementPeriod: form.settlementPeriod, contactName: form.contactName,
        pickedApprover: form.pickedApprover || undefined,
        dynamicFieldValues: Object.keys(dynamicValues).length > 0 ? dynamicValues : undefined,
        status: draft ? 'draft' : 'in_review', approvalStatus: draft ? '草稿' : '审批中',
        updatedAt: now, submitTime: draft ? undefined : now,
      });
      toast.success(draft ? '草稿已保存' : '已重新提交审批');
      router.push(`/mobile/approvals/${id}`);
    } catch { toast.error('保存失败'); }
    finally { setSaving(false); }
  };

  const isContractLog = form.serviceProduct === '合同物流';

  return (
    <div className="flex flex-col gap-3 pb-[calc(120px+var(--mobile-tab-height))]">
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#EBEBEB] text-[#5A5A5A] active:bg-[#F5F5F5]" onClick={() => router.back()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-[#0A0A0A]">编辑审批</h1>
      </div>

      <MobileFormSection title="公司信息"><Field label="公司全称" required error={errors.has('companyName')}><input className="mobile-input" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} /></Field></MobileFormSection>

      <MobileFormSection title="业务信息">
        <Field label="服务产品" required><select className="mobile-input" value={form.serviceProduct} onChange={(e) => updateField('serviceProduct', e.target.value)}>{SERVICE_PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}</select></Field>
        {isContractLog && <Field label="职能审批人" required><select className="mobile-input" value={form.pickedApprover} onChange={(e) => updateField('pickedApprover', e.target.value)}><option value="">请选择</option>{CONTRACT_LOGISTICS_APPROVERS.map((a) => <option key={a} value={a}>{a}</option>)}</select></Field>}
        <Field label="贸易代理" required><select className="mobile-input" value={form.isTradeAgent} onChange={(e) => updateField('isTradeAgent', e.target.value)}><option value="否">否</option><option value="是">是</option></select></Field>
        <Field label="业务类型" required><select className="mobile-input" value={form.businessType} onChange={(e) => updateField('businessType', e.target.value)}>{BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
        <Field label="货物类型" required><input className="mobile-input" value={form.goodsType} onChange={(e) => updateField('goodsType', e.target.value)} /></Field>
        <Field label="结算账期" required><input className="mobile-input" value={form.settlementPeriod} onChange={(e) => updateField('settlementPeriod', e.target.value)} /></Field>
        <Field label="联系人" required><input className="mobile-input" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} /></Field>
        <Field label="月均订单数" required><select className="mobile-input" value={form.monthlyOrders} onChange={(e) => updateField('monthlyOrders', e.target.value)}><option value="">请选择</option>{MONTHLY_ORDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
        <Field label="月均开票额" required><select className="mobile-input" value={form.monthlyInvoiceAmount} onChange={(e) => updateField('monthlyInvoiceAmount', e.target.value)}><option value="">请选择</option>{MONTHLY_INVOICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
        <Field label="通关KPI" required><textarea className="mobile-textarea" rows={3} value={form.customsKpi} onChange={(e) => updateField('customsKpi', e.target.value)} /></Field>
        <Field label="运输KPI" required><textarea className="mobile-textarea" rows={3} value={form.transportKpi} onChange={(e) => updateField('transportKpi', e.target.value)} /></Field>
        <Field label="仓库要求" required><textarea className="mobile-textarea" rows={3} value={form.warehouseRequirement} onChange={(e) => updateField('warehouseRequirement', e.target.value)} /></Field>
        <Field label="定制化服务" required><select className="mobile-input" value={form.customServiceRequirement} onChange={(e) => updateField('customServiceRequirement', e.target.value)}><option value="">请选择</option>{CUSTOM_SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
        <Field label="定制化描述" required><textarea className="mobile-textarea" rows={4} value={form.customRequirementDescription} onChange={(e) => updateField('customRequirementDescription', e.target.value)} /></Field>
      </MobileFormSection>

      {relevantFields.length > 0 && (
        <MobileFormSection title={`合规审核 · ${form.serviceProduct}`}><MobileDynamicFields fields={relevantFields} values={dynamicValues} onChange={(fk, v) => { setDynamicValues((p) => ({ ...p, [fk]: v })); setErrors((p) => { const n = new Set(p); n.delete(`dynamic_${fk}`); return n; }); }} /></MobileFormSection>
      )}

      {reportData && reportData.items.length > 0 && (
        <MobileFormSection title={`审批辅助报告 · ${reportData.passCount}通过 ${reportData.warnCount}风险`}><ApprovalReportMini customerName={form.companyName} serviceProduct={form.serviceProduct} generatedAt={new Date().toISOString()} items={reportData.items} passCount={reportData.passCount} warnCount={reportData.warnCount} /></MobileFormSection>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] px-4 py-3 flex gap-3 z-40" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px) + 56px)' }}>
        <button className="flex-1 h-11 border border-[#EBEBEB] text-[#5A5A5A] rounded-xl text-sm font-semibold active:bg-[#F5F5F5]" onClick={() => handleSave(true)} disabled={saving}>暂存草稿</button>
        <button className="flex-1 h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA]" onClick={() => handleSave(false)} disabled={saving}>重新提交</button>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return <div data-error={error ? 'true' : undefined}><label className={`text-sm font-medium block mb-1.5 ${error ? 'text-[#D63031]' : 'text-[#0A0A0A]'}`}>{label}{required && <span className="text-[#D63031] ml-0.5">*</span>}</label>{children}{error && <p className="text-xs text-[#D63031] mt-1">请填写{label}</p>}</div>;
}
