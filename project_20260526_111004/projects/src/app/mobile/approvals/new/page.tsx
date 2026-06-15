'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, evaluateApprovalRules } from '@/lib/store';
import type { RiskApproval, ApprovalField } from '@/lib/types';
import MobileFormSection from '@/components/mobile/MobileFormSection';
import MobileDynamicFields from '@/components/mobile/MobileDynamicFields';
import ApprovalReportMini from '@/components/mobile/ApprovalReportMini';

// ====== PRD §5.6 严格对齐的枚举 ======
const SERVICE_PRODUCTS = ['货代', '关务', '仓库', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他'];
const BUSINESS_TYPES = ['保税', '口岸完税', '免税', '试单', '其他'];
// PRD 规范：月均订单数
const MONTHLY_ORDER_OPTIONS = ['0-5单', '6-10单', '11-20单', '21-50单', '50单以上'];
// PRD 规范：月均开票额
const MONTHLY_INVOICE_OPTIONS = ['0-5k元', '5k-2w元', '2w-10w元', '10w元以上'];
// PRD 规范：定制化服务需求
const CUSTOM_SERVICE_OPTIONS = ['信息系统', '运输', '仓储', '财务', '仅标准服务'];

export default function MobileNewApprovalPage() {
  const router = useRouter();
  const { addRiskApproval, currentUser, approvalFields, autoApprovalRules } = useApp();
  const [saving, setSaving] = useState(false);

  // 表单状态
  const [form, setForm] = useState({
    // 公司信息
    companyName: '',
    englishName: '',
    parentCompany: '',
    subsidiaryCompany: '',
    // 关联信息
    serviceProduct: '货代',
    businessCustomerIds: '' as string, // 简化：逗号分隔
    opportunityId: '',
    invoiceInfoIds: '' as string,
    settlementPeriod: '',
    contactName: '',
    // 业务信息（与 PRD 严格对齐）
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
  });

  // 合规审核动态字段值
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 按服务产品过滤合规审核字段
  const relevantFields = useMemo(() => {
    return approvalFields.filter(
      (f) => (f.serviceProducts as string[])?.includes(form.serviceProduct) || f.status !== 'inactive'
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
    return {
      items,
      passCount: items.filter((r) => r.result === 'pass').length,
      warnCount: items.filter((r) => r.result === 'warn').length,
    };
  }, [form, autoApprovalRules, approvalFields]);

  const handleSubmit = async (draft: boolean) => {
    if (!form.companyName.trim()) return;
    setSaving(true);

    const now = new Date().toISOString();
    const baseSteps = [
      { id: 'init', name: '发起审批', role: '申请人', status: draft ? 'current' : 'completed' as const, approver: currentUser.name, level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: draft ? 'pending' as const : 'current' as const, approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批人审批', role: '职能审批人', status: 'pending' as const, approver: getFunctionalApprover(form.serviceProduct), level: 3 },
      { id: 'fin', name: '财务+中心总经理会签', role: '财务+总经理', status: 'pending' as const, approver: '', level: 4, isCountersign: true },
      { id: 'gm', name: '总经理审批', role: '总经理', status: 'pending' as const, approver: '赵总', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending' as const, approver: '李工', level: 6 },
    ];

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
      approvalSteps: baseSteps,
      dynamicFieldValues: Object.keys(dynamicValues).length > 0 ? dynamicValues : undefined,
      status: draft ? 'draft' : 'in_review',
      approvalStatus: draft ? '草稿' : '审批中',
      updatedAt: now,
      submitTime: draft ? undefined : now,
      history: draft ? [] : [{
        id: `hist-${Date.now()}`,
        approvalId: '',
        action: 'submitted' as const,
        operator: currentUser.id,
        operatorName: currentUser.name,
        timestamp: now,
      }],
    };

    addRiskApproval(newApproval);
    setSaving(false);
    router.push('/mobile/approvals');
  };

  return (
    <div className="flex flex-col gap-3 pb-28">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#EBEBEB] text-[#5A5A5A] active:bg-[#F5F5F5]"
          onClick={() => router.back()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#0A0A0A]">新建审批</h1>
      </div>

      {/* ====== 第一层：公司信息（必填字段，默认展开） ====== */}
      <MobileFormSection title="公司信息" defaultExpanded>
        <FieldRow label="公司全称" required>
          <input
            type="text"
            className="mobile-input"
            placeholder="输入公司全称"
            value={form.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
          />
        </FieldRow>
      </MobileFormSection>

      {/* ====== 第一层：关联信息（必填字段，默认展开） ====== */}
      <MobileFormSection title="关联信息" defaultExpanded>
        <FieldRow label="服务产品" required>
          <select className="mobile-input" value={form.serviceProduct} onChange={(e) => updateField('serviceProduct', e.target.value)}>
            {SERVICE_PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="结算账期" required>
          <input type="text" className="mobile-input" placeholder="如：月结30天" value={form.settlementPeriod} onChange={(e) => updateField('settlementPeriod', e.target.value)} />
        </FieldRow>
        <FieldRow label="联系人" required>
          <input type="text" className="mobile-input" placeholder="输入联系人姓名" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} />
        </FieldRow>
      </MobileFormSection>

      {/* ====== 第一层：业务信息（必填，默认展开） ====== */}
      <MobileFormSection title="业务信息" defaultExpanded>
        <FieldRow label="是否涉及贸易代理" required>
          <select className="mobile-input" value={form.isTradeAgent} onChange={(e) => updateField('isTradeAgent', e.target.value)}>
            <option value="否">否</option>
            <option value="是">是</option>
          </select>
        </FieldRow>
        {form.isTradeAgent === '是' && (
          <div className="text-xs text-[#E8850C] bg-[#FFF4E8] px-3 py-2 rounded-lg">
            ⚠️ 贸易代理将自动追加审批人「白沥」
          </div>
        )}
        <FieldRow label="业务类型" required>
          <select className="mobile-input" value={form.businessType} onChange={(e) => updateField('businessType', e.target.value)}>
            {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="货物类型" required>
          <input type="text" className="mobile-input" placeholder="如：半导体设备" value={form.goodsType} onChange={(e) => updateField('goodsType', e.target.value)} />
        </FieldRow>
      </MobileFormSection>

      {/* ====== 第二层：更多业务信息（可选，默认折叠） ====== */}
      <MobileFormSection title="更多业务信息" subtitle="可选" defaultExpanded={false}>
        <FieldRow label="月均订单数">
          <select className="mobile-input" value={form.monthlyOrders} onChange={(e) => updateField('monthlyOrders', e.target.value)}>
            <option value="">请选择</option>
            {MONTHLY_ORDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="月均开票额">
          <select className="mobile-input" value={form.monthlyInvoiceAmount} onChange={(e) => updateField('monthlyInvoiceAmount', e.target.value)}>
            <option value="">请选择</option>
            {MONTHLY_INVOICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="通关KPI要求">
          <textarea className="mobile-textarea" rows={3} placeholder="通关时效要求等" value={form.customsKpi} onChange={(e) => updateField('customsKpi', e.target.value)} />
        </FieldRow>
        <FieldRow label="运输KPI要求">
          <textarea className="mobile-textarea" rows={3} placeholder="运输时效要求等" value={form.transportKpi} onChange={(e) => updateField('transportKpi', e.target.value)} />
        </FieldRow>
        <FieldRow label="仓库租赁要求">
          <textarea className="mobile-textarea" rows={3} placeholder="面积/位置/条件等" value={form.warehouseRequirement} onChange={(e) => updateField('warehouseRequirement', e.target.value)} />
        </FieldRow>
        <FieldRow label="定制化服务需求">
          <select className="mobile-input" value={form.customServiceRequirement} onChange={(e) => updateField('customServiceRequirement', e.target.value)}>
            <option value="">请选择</option>
            {CUSTOM_SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="定制化需求描述">
          <textarea className="mobile-textarea" rows={4} placeholder="详细描述定制化需求" value={form.customRequirementDescription} onChange={(e) => updateField('customRequirementDescription', e.target.value)} />
        </FieldRow>
      </MobileFormSection>

      {/* ====== 第三层：公司信息补充（默认折叠） ====== */}
      <MobileFormSection title="公司信息补充" subtitle="可选" defaultExpanded={false}>
        <FieldRow label="英文名称">
          <input type="text" className="mobile-input" placeholder="境外客户必填" value={form.englishName} onChange={(e) => updateField('englishName', e.target.value)} />
        </FieldRow>
        <FieldRow label="集团（母）公司名称">
          <input type="text" className="mobile-input" placeholder="输入集团母公司名称" value={form.parentCompany} onChange={(e) => updateField('parentCompany', e.target.value)} />
        </FieldRow>
        <FieldRow label="分（子）公司名称">
          <input type="text" className="mobile-input" placeholder="输入分/子公司名称" value={form.subsidiaryCompany} onChange={(e) => updateField('subsidiaryCompany', e.target.value)} />
        </FieldRow>
      </MobileFormSection>

      {/* ====== 第四层：合规审核区（动态字段） ====== */}
      {relevantFields.length > 0 && (
        <MobileFormSection title={`合规审核 · ${form.serviceProduct}`} defaultExpanded>
          <MobileDynamicFields
            fields={relevantFields}
            values={dynamicValues}
            onChange={(fieldKey, value) => setDynamicValues((prev) => ({ ...prev, [fieldKey]: value }))}
          />
        </MobileFormSection>
      )}

      {/* ====== 审批辅助报告（实时预览） ====== */}
      {reportData && reportData.items.length > 0 && (
        <MobileFormSection title="审批辅助报告" subtitle={`${reportData.passCount}通过 · ${reportData.warnCount}风险`} defaultExpanded={reportData.warnCount > 0}>
          <ApprovalReportMini
            customerName={form.companyName}
            serviceProduct={form.serviceProduct}
            generatedAt={new Date().toISOString()}
            items={reportData.items}
            passCount={reportData.passCount}
            warnCount={reportData.warnCount}
          />
        </MobileFormSection>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] px-4 py-3 flex gap-3 z-40"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px) + 56px)' }}
      >
        <button
          className="flex-1 h-11 border border-[#EBEBEB] text-[#5A5A5A] rounded-xl text-sm font-semibold active:bg-[#F5F5F5] transition-colors disabled:opacity-50"
          onClick={() => handleSubmit(true)}
          disabled={saving || !form.companyName.trim()}
        >
          暂存草稿
        </button>
        <button
          className="flex-1 h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA] transition-colors disabled:opacity-50"
          onClick={() => handleSubmit(false)}
          disabled={saving || !form.companyName.trim()}
        >
          提交审批
        </button>
      </div>
    </div>
  );
}

// ====== 辅助函数 ======

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#0A0A0A] block mb-1.5">
        {label}
        {required && <span className="text-[#D63031] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/** PRD §5.6.5：按服务产品返回职能审批人 */
function getFunctionalApprover(serviceProduct: string): string {
  const map: Record<string, string> = {
    '货代': '张洁',
    '进出口': '张洁',
    '一体化供应链': '张洁',
    '其他': '张洁',
    '关务': '蒋总',
    '维修': '蒋总',
    '仓库': '吴总',
    '运输': '朱弢',
    '合同物流': '', // 四选一
  };
  return map[serviceProduct] || '张洁';
}
