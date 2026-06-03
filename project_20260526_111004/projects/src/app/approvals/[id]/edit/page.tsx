'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useApp, evaluateApprovalRules } from '@/lib/store';
import { RuleTriggeredApprover, ServiceProduct } from '@/lib/types';
import ApprovalFlowVisual from '@/components/ApprovalFlowVisual';
import ApprovalReport from '@/components/ApprovalReport';

const SERVICE_PRODUCTS = ['货代', '关务', '仓库', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他'];
const BUSINESS_TYPES = ['保税', '口岸完税', '免税', '试单', '其他'];
const MONTHLY_VOLUMES = ['0-50', '51-100', '101-500', '500以上'];
const CUSTOM_SERVICE_OPTIONS = ['信息系统', '运输', '仓库', '财务', '仅涉及标准服务内容'];
const RISK_PURPOSES = ['业务可行性评审', '仅增加结算单位', '仅增加境外收发货人'];
const HMG_RELATIONS = ['客户', '供应商', '最终用户', '结算单位', '内部用户'];

const SERVICE_APPROVERS: Record<string, { approvers: string[]; isPickOne?: boolean }> = {
  '货代': { approvers: ['张洁'] },
  '关务': { approvers: ['蒋总'] },
  '仓库': { approvers: ['吴总'] },
  '运输': { approvers: ['朱弢'] },
  '进出口': { approvers: ['张洁'] },
  '维修': { approvers: ['蒋总'] },
  '合同物流': { approvers: ['张洁', '蒋总', '吴总', '朱弢'], isPickOne: true },
  '一体化供应链': { approvers: ['张洁'] },
  '其他': { approvers: ['张洁'] },
};

const mockBusinessCustomers = [
  { id: 'bc1', name: '应用材料(中国)有限公司' },
  { id: 'bc2', name: '飞雅贸易(上海)有限公司' },
  { id: 'bc3', name: '荏原机械(中国)有限公司' },
  { id: 'bc4', name: '昇先创国际贸易(上海)有限公司' },
  { id: 'bc5', name: '上海华力集成电路制造有限公司' },
  { id: 'bc6', name: '苏斯贸易(上海)有限公司' },
  { id: 'bc7', name: '武汉光库科技有限公司' },
  { id: 'bc8', name: '江苏鑫华半导体科技股份有限公司' },
  { id: 'bc9', name: '上海裘瑞经贸有限公司' },
  { id: 'bc10', name: '中芯国际集成电路制造有限公司' },
  { id: 'bc11', name: '长江存储科技有限责任公司' },
];

const mockInvoiceInfos = [
  { id: 'inv1', title: '8635 - 应用材料(中国)有限公司', taxNumber: '91310000607239088X' },
  { id: 'inv2', title: '8639 - 飞雅贸易(上海)有限公司', taxNumber: '91310000607239089Y' },
  { id: 'inv3', title: '8641 - 荏原机械(中国)有限公司', taxNumber: '91310000607239090Z' },
  { id: 'inv4', title: '8644 - 昇先创国际贸易(上海)有限公司', taxNumber: '91310000607239091A' },
  { id: 'inv5', title: '8603 - 上海华力集成电路制造有限公司', taxNumber: '91310000607239092B' },
  { id: 'inv6', title: '8612 - 武汉光库科技有限公司', taxNumber: '914201007713589677' },
  { id: 'inv7', title: '8625 - 江苏鑫华半导体科技股份有限公司', taxNumber: '91320301MA1MCPLL8F' },
  { id: 'inv8', title: '8630 - 上海裘瑞经贸有限公司', taxNumber: '91310118738523211W' },
  { id: 'inv9', title: '8648 - 中芯国际集成电路制造有限公司', taxNumber: '91310000MA1FL5N06M' },
  { id: 'inv10', title: '8655 - 长江存储科技有限责任公司', taxNumber: '91420100MA4KN4K47W' },
];

const mockOpportunities = [
  { id: 'opp1', title: '应用材料-货代服务', customer: '应用材料(中国)有限公司', serviceProduct: '货代' },
  { id: 'opp2', title: '飞雅贸易-仓储服务', customer: '飞雅贸易(上海)有限公司', serviceProduct: '仓储' },
  { id: 'opp3', title: '荏原机械-运输服务', customer: '荏原机械(中国)有限公司', serviceProduct: '运输' },
  { id: 'opp4', title: '昇先创-进出口服务', customer: '昇先创国际贸易(上海)有限公司', serviceProduct: '进出口' },
  { id: 'opp5', title: '上海华力-一体化供应链', customer: '上海华力集成电路制造有限公司', serviceProduct: '合同物流' },
];

const mockApprovals = [
  {
    id: '1', status: 'pending', isTradeAgent: '是', serviceProduct: '货代', businessType: '保税', goodsType: '半导体设备', monthlyBusinessVolume: '101-500', monthlyInvoiceAmount: '约50万/月',
    customsKpiRequirement: '通关时效≤24小时，单证准确率≥99.5%', transportKpiRequirement: '运输时效≤48小时，货损率≤0.1%', warehouseLeaseRequirement: '需常温仓库2000㎡，位于浦东机场附近',
    customServiceRequirement: '信息系统', customRequirementDescription: '需要对接客户ERP系统，实现订单自动推送和状态回传',
    companyName: '应用材料(中国)有限公司', englishName: 'Applied Materials China Co., Ltd.', parentCompany: 'Applied Materials, Inc.', subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审', relationshipWithHMG: '客户',
    businessCustomerIds: ['bc1'], suggestedSystemCode: 'AMC-2026-001', opportunityId: 'opp1', invoiceInfoIds: ['inv1'], settlementPeriod: '月结30天', contactName: '李总',
  },
  {
    id: '2', status: 'approved', isTradeAgent: '否', serviceProduct: '仓储', businessType: '口岸完税', goodsType: '电子元器件', monthlyBusinessVolume: '51-100', monthlyInvoiceAmount: '约30万/月',
    customsKpiRequirement: '无特殊要求', transportKpiRequirement: '无特殊要求', warehouseLeaseRequirement: '需恒温恒湿仓库500㎡，位于外高桥保税区',
    customServiceRequirement: '仓储', customRequirementDescription: '需要VMI库存管理服务，支持按需出库',
    companyName: '飞雅贸易(上海)有限公司', englishName: 'Fiya Trading (Shanghai) Co., Ltd.', parentCompany: '', subsidiaryCompany: '飞雅贸易深圳分公司',
    riskControlPurpose: '仅增加结算单位', relationshipWithHMG: '客户',
    businessCustomerIds: ['bc2'], suggestedSystemCode: 'FYC-2026-002', opportunityId: 'opp2', invoiceInfoIds: ['inv2'], settlementPeriod: '月结45天', contactName: '王经理',
  },
  {
    id: '3', status: 'in_review', isTradeAgent: '是', serviceProduct: '运输', businessType: '免税', goodsType: '精密仪器', monthlyBusinessVolume: '0-50', monthlyInvoiceAmount: '约15万/月',
    customsKpiRequirement: '通关时效≤12小时，需AEO认证通道', transportKpiRequirement: '运输时效≤24小时，需全程GPS跟踪，货损率≤0.05%', warehouseLeaseRequirement: '需临时中转仓300㎡，位于虹桥机场附近',
    customServiceRequirement: '运输', customRequirementDescription: '需要专车运输服务，配备防震设备和温控系统',
    companyName: '荏原机械(中国)有限公司', englishName: 'Ebara Machinery China Co., Ltd.', parentCompany: '荏原制作所', subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审', relationshipWithHMG: '客户',
    businessCustomerIds: ['bc3'], suggestedSystemCode: 'YBJ-2026-003', opportunityId: 'opp3', invoiceInfoIds: ['inv3'], settlementPeriod: '月结60天', contactName: '张总监',
  },
  {
    id: '4', status: 'draft', isTradeAgent: '否', serviceProduct: '进出口', businessType: '试单', goodsType: '化工原料', monthlyBusinessVolume: '500以上', monthlyInvoiceAmount: '约100万/月',
    customsKpiRequirement: '通关时效≤6小时，需危化品通关资质', transportKpiRequirement: '运输需危化品运输资质，全程温控监测', warehouseLeaseRequirement: '需危化品专用仓库1000㎡，甲类资质',
    customServiceRequirement: '仅涉及标准服务内容', customRequirementDescription: '无特殊定制化需求',
    companyName: '昇先创国际贸易(上海)有限公司', englishName: 'Sunson International Trading Co., Ltd.', parentCompany: '', subsidiaryCompany: '',
    riskControlPurpose: '仅增加境外收发货人', relationshipWithHMG: '供应商',
    businessCustomerIds: ['bc4', 'bc6'], suggestedSystemCode: 'SXC-2026-004', opportunityId: 'opp4', invoiceInfoIds: ['inv4'], settlementPeriod: '月结30天', contactName: '陈主管',
  },
  {
    id: '5', status: 'rejected', isTradeAgent: '否', serviceProduct: '合同物流', businessType: '保税', goodsType: '集成电路芯片', monthlyBusinessVolume: '101-500', monthlyInvoiceAmount: '约80万/月',
    customsKpiRequirement: '通关时效≤4小时，需无纸化通关', transportKpiRequirement: '运输时效≤12小时，需恒温运输', warehouseLeaseRequirement: '需洁净仓库3000㎡，无尘环境',
    customServiceRequirement: '信息系统', customRequirementDescription: '需要WMS/TMS系统对接，实现库存和运输全程可视化',
    companyName: '上海华力集成电路制造有限公司', englishName: 'Shanghai Huahong Grace Semiconductor Co., Ltd.', parentCompany: '华虹集团', subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审', relationshipWithHMG: '客户',
    businessCustomerIds: ['bc5'], suggestedSystemCode: 'HHL-2026-005', opportunityId: 'opp5', invoiceInfoIds: ['inv5'], settlementPeriod: '月结15天', contactName: '赵副总',
  },
];

export default function ApprovalEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { approvalFields, approvalWorkflows, autoApprovalRules, riskApprovals, updateRiskApproval } = useApp();
  const approval = riskApprovals.find((a) => a.id === id) || riskApprovals[0];

  const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    draft: { label: '草稿', bg: 'bg-[#EBEBEB]', text: 'text-[#999]' },
    pending: { label: '待审批', bg: 'bg-[#FEFCE8]', text: 'text-[#CA8A04]' },
    in_review: { label: '审批中', bg: 'bg-[#E8F4FF]', text: 'text-[#2D3BFF]' },
    approved: { label: '已通过', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
    rejected: { label: '已拒绝', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
  };

  const derivedStatus = useMemo(() => {
    const steps = approval.approvalSteps || [];
    if (steps.length === 0) return 'draft';
    const anyRejected = steps.some((s: Record<string, unknown>) => s.rejected === true);
    if (anyRejected) return 'rejected';
    const initiatorStep = steps.find((s: Record<string, unknown>) => s.level === 1);
    if (initiatorStep?.status === 'current') return 'draft';
    const allCompleted = steps.every((s: Record<string, unknown>) => s.status === 'completed');
    if (allCompleted) return 'approved';
    const hasCurrent = steps.some((s: Record<string, unknown>) => s.status === 'current');
    if (hasCurrent) return 'in_review';
    return 'pending';
  }, [approval.approvalSteps]);

  const isEditable = derivedStatus === 'draft' || derivedStatus === 'rejected';
  const statusLabel = STATUS_MAP[derivedStatus]?.label || derivedStatus;

  const [formData, setFormData] = useState(approval);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>(
    ((approval as unknown as Record<string, unknown>).dynamicFieldValues as Record<string, string>) || {}
  );

  const dynamicFields = useMemo(() => {
    if (!formData.serviceProduct) return [];
    return approvalFields.filter(
      f => f.status === 'active' && f.serviceProducts.includes(formData.serviceProduct as ServiceProduct)
    );
  }, [approvalFields, formData.serviceProduct]);

  const matchedWorkflow = useMemo(() => {
    if (!formData.serviceProduct) return null;
    return approvalWorkflows.find(
      w => w.status === 'active' && w.serviceProduct === formData.serviceProduct
    ) || null;
  }, [approvalWorkflows, formData.serviceProduct]);

  const ruleTriggeredApprovers: RuleTriggeredApprover[] = useMemo(() => {
    const result: RuleTriggeredApprover[] = [];
    if (formData.isTradeAgent === '是') {
      result.push({
        approver: { id: 'baili', name: '白沥', role: '贸易代理职能审批人' },
        reason: '涉及贸易代理',
        ruleId: 'rule-trade-agent',
      });
    }
    return result;
  }, [formData.isTradeAgent]);

  // 合并动态字段和固定字段用于规则评估
  const allFieldValues = useMemo(() => ({
    ...dynamicFieldValues,
    monthly_orders: formData.monthly_orders || '',
    monthly_invoice_amount: formData.monthly_invoice_amount || '',
    is_trade_agent: formData.isTradeAgent || '',
    service_regions: (dynamicFieldValues['service_regions'] || ''),
  }), [dynamicFieldValues, formData.monthly_orders, formData.monthly_invoice_amount, formData.isTradeAgent]);

  // 实时报告评估
  const liveReport = useMemo(() => {
    const results = evaluateApprovalRules(
      allFieldValues || {},
      autoApprovalRules,
      approvalFields,
      formData.serviceProduct,
    );
    const items: Array<{ ruleName: string; fieldName: string; result: 'pass' | 'warn'; reason: string }> = [];
    let passCount = 0;
    let warnCount = 0;

    results.forEach((value) => {
      if (value.result === 'pass') passCount++;
      else warnCount++;
      items.push({
        ruleName: value.ruleName,
        fieldName: value.fieldName,
        result: value.result,
        reason: value.reason,
      });
    });

    return { items, passCount, warnCount };
  }, [allFieldValues, autoApprovalRules, approvalFields]);

  const handleDynamicFieldChange = (fieldKey: string, value: string) => {
    setDynamicFieldValues(prev => ({ ...prev, [fieldKey]: value }));
  };
  const [selectorOpen, setSelectorOpen] = useState<"businessCustomer" | "invoiceInfo" | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [opportunitySearch, setOpportunitySearch] = useState("");
  const [showOpportunityDropdown, setShowOpportunityDropdown] = useState(false);
  const [pickedApprover, setPickedApprover] = useState("");
  const opportunityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (opportunityRef.current && !opportunityRef.current.contains(e.target as Node)) setShowOpportunityDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'serviceProduct') setPickedApprover('');
  };

  const toggleMultiSelect = (field: "businessCustomerIds" | "invoiceInfoIds", id: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(id) ? (prev[field] as string[]).filter((i: string) => i !== id) : [...(prev[field] as string[]), id],
    }));
  };

  const getSelectedNames = (ids: string[], list: { id: string; name?: string; title?: string }[]) => {
    return ids.map((itemId: string) => list.find((item) => item.id === itemId)?.name || list.find((item) => item.id === itemId)?.title || itemId);
  };

  const currentApproverConfig = formData.serviceProduct ? SERVICE_APPROVERS[formData.serviceProduct] : null;

  const handlePickApprover = (approver: string) => {
    setPickedApprover(approver);
  };

  const handleSave = () => {
    if (currentApproverConfig?.isPickOne && !pickedApprover) {
      alert('合同物流必须选择一位职能审批人');
      return;
    }
    const { id: _fid, ...rest } = formData as any;
    updateRiskApproval(id, {
      ...rest,
      pickedApprover: pickedApprover || (approval as any).pickedApprover,
      dynamicFieldValues: { ...dynamicFieldValues },
    } as any);
    router.push(`/approvals/${id}`);
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push(`/approvals/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">编辑风控审批</h1>
            <p className="text-[#5A5A5A] mt-1">编辑客户风险控制审批申请</p>
          </div>
          <div className="flex-1" />
          {isEditable ? (
            <>
              <button onClick={() => router.push('/approvals')} className="px-6 py-2 border border-[#EBEBEB] text-[#666] rounded-lg hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={handleSave} className="px-6 py-2 bg-[#2D3BFF] text-white rounded-lg hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all">保存</button>
            </>
          ) : (
            <button onClick={() => router.push(`/approvals/${id}`)} className="px-6 py-2 bg-[#2D3BFF] text-white rounded-lg hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all">返回查看</button>
          )}
        </div>

        <div className="mt-6">
          {!isEditable && (
            <div className="bg-[#FEFCE8] border border-[#FDE68A] rounded-xl p-4 mb-6 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <p className="text-sm font-medium text-[#CA8A04]">无法编辑</p>
                <p className="text-xs text-[#CA8A04]/70 mt-0.5">只有草稿或已拒绝状态的审批可以编辑，当前审批状态为「{statusLabel}」</p>
              </div>
              <div className="flex-1" />
              <button onClick={() => router.push(`/approvals/${id}`)} className="text-sm text-[#2D3BFF] hover:underline">返回查看</button>
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className={`grid grid-cols-12 gap-6 ${!isEditable ? 'pointer-events-none opacity-60' : ''}`}>
              <div className="col-span-7 space-y-6">
                {/* 公司信息 */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">公司信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">公司全称 <span className="text-red-500">*</span></label><input type="text" value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} placeholder="签约名称" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">英文名称</label><input type="text" value={formData.englishName} onChange={(e) => handleChange('englishName', e.target.value)} placeholder="境外客户必填" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">集团（母）公司名称</label><input type="text" value={formData.parentCompany} onChange={(e) => handleChange('parentCompany', e.target.value)} placeholder="请输入集团母公司名称" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">分（子）公司名称</label><input type="text" value={formData.subsidiaryCompany} onChange={(e) => handleChange('subsidiaryCompany', e.target.value)} placeholder="请输入分子公司名称" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                  </div>
                </div>

                {/* 风控信息 */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">风控信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">风险控制目的 <span className="text-red-500">*</span></label><SearchableSelect value={formData.riskControlPurpose || ''} onChange={(value) => handleChange('riskControlPurpose', value)} options={RISK_PURPOSES.map((p) => ({ value: p, label: p }))} placeholder="请选择" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">此公司与HMG的关系 <span className="text-red-500">*</span></label><SearchableSelect value={formData.relationshipWithHMG || ''} onChange={(value) => handleChange('relationshipWithHMG', value)} options={HMG_RELATIONS.map((r) => ({ value: r, label: r }))} placeholder="请选择" /></div>
                  </div>
                </div>

                {/* 关联信息 */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">关联信息</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">业务主客户 <span className="text-red-500">*</span></label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {getSelectedNames(formData.businessCustomerIds || [], mockBusinessCustomers.map((c) => ({ id: c.id, name: c.name }))).map((name, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F4FF] text-[#2D3BFF] rounded-lg text-sm">{name}<button type="button" onClick={() => toggleMultiSelect('businessCustomerIds', (formData.businessCustomerIds || [])[i])} className="hover:text-red-500 text-base">×</button></span>
                          ))}
                        </div>
                        <button type="button" onClick={() => { setSearchTerm(''); setSelectorOpen('businessCustomer'); }} className="w-full bg-white border border-dashed border-[#D5D5D5] rounded-xl px-4 py-3 text-sm text-[#999] hover:border-[#2D3BFF] hover:text-[#2D3BFF] transition-colors">+ 选择业务主客户</button>
                      </div>
                    </div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">建议系统代码 <span className="text-red-500">*</span></label><input type="text" value={formData.suggestedSystemCode} onChange={(e) => handleChange('suggestedSystemCode', e.target.value)} placeholder="请输入建议系统代码" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">商机 <span className="text-red-500">*</span></label>
                      <div className="relative" ref={opportunityRef}>
                        <input type="text" value={opportunitySearch} onChange={(e) => { setOpportunitySearch(e.target.value); setShowOpportunityDropdown(true); }} onFocus={() => setShowOpportunityDropdown(true)} placeholder="搜索并选择商机" className="w-full bg-white border border-[#D5D5D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 focus:border-[#2D3BFF]" />
                        {formData.opportunityId && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <span className="text-sm text-[#2D3BFF] bg-[#E8F4FF] px-3 py-1 rounded-lg">{mockOpportunities.find((o) => o.id === formData.opportunityId)?.title}</span>
                          </div>
                        )}
                        <button type="button" onClick={() => setShowOpportunityDropdown(!showOpportunityDropdown)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
                        {showOpportunityDropdown && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-auto">
                            {mockOpportunities.filter((o) => o.title.toLowerCase().includes(opportunitySearch.toLowerCase()) || o.customer.toLowerCase().includes(opportunitySearch.toLowerCase())).length === 0 ? (
                              <div className="px-4 py-3 text-sm text-[#999999]">无匹配结果</div>
                            ) : (
                              mockOpportunities.filter((o) => o.title.toLowerCase().includes(opportunitySearch.toLowerCase()) || o.customer.toLowerCase().includes(opportunitySearch.toLowerCase())).map((o) => (
                                <button key={o.id} type="button" onClick={() => { handleChange('opportunityId', o.id); setOpportunitySearch(''); setShowOpportunityDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors ${formData.opportunityId === o.id ? 'bg-[#E8F4FF] text-[#2D3BFF]' : 'text-[#0A0A0A]'}`}>
                                  <div className="font-medium">{o.title}</div>
                                  <div className="text-xs text-[#999999] mt-0.5">{o.customer} · {o.serviceProduct}</div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">客户开票信息 <span className="text-red-500">*</span></label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {getSelectedNames(formData.invoiceInfoIds || [], mockInvoiceInfos.map((inv) => ({ id: inv.id, name: inv.title }))).map((name, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF7ED] text-[#EA580C] rounded-lg text-sm">{name}<button type="button" onClick={() => toggleMultiSelect('invoiceInfoIds', (formData.invoiceInfoIds || [])[i])} className="hover:text-red-500 text-base">×</button></span>
                          ))}
                        </div>
                        <button type="button" onClick={() => { setSearchTerm(''); setSelectorOpen('invoiceInfo'); }} className="w-full bg-white border border-dashed border-[#D5D5D5] rounded-xl px-4 py-3 text-sm text-[#999] hover:border-[#2D3BFF] hover:text-[#2D3BFF] transition-colors">+ 选择客户开票信息</button>
                      </div>
                    </div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">结算账期 <span className="text-red-500">*</span></label><input type="text" value={formData.settlementPeriod} onChange={(e) => handleChange('settlementPeriod', e.target.value)} placeholder="请输入结算账期" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">联系人 <span className="text-red-500">*</span></label><input type="text" value={formData.contactName} onChange={(e) => handleChange('contactName', e.target.value)} placeholder="请输入联系人" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                  </div>
                </div>

                {/* 业务信息 */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">业务信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">是否涉及贸易代理 <span className="text-red-500">*</span></label><SearchableSelect value={formData.isTradeAgent || ''} onChange={(value) => handleChange('isTradeAgent', value)} options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]} placeholder="请选择" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">服务产品 <span className="text-red-500">*</span></label><SearchableSelect value={formData.serviceProduct || ''} onChange={(value) => handleChange('serviceProduct', value)} options={SERVICE_PRODUCTS.map((p) => ({ value: p, label: p }))} placeholder="请选择服务产品" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">业务类型 <span className="text-red-500">*</span></label><SearchableSelect value={formData.businessType || ''} onChange={(value) => handleChange('businessType', value)} options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))} placeholder="请选择业务类型" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">货物类型 <span className="text-red-500">*</span></label><input type="text" value={formData.goodsType} onChange={(e) => handleChange('goodsType', e.target.value)} placeholder="请输入货物类型" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">月均订单数 <span className="text-red-500">*</span></label><SearchableSelect value={formData.monthly_orders || ''} onChange={(value) => handleChange('monthly_orders', value)} options={['0-5单','6-10单','11-20单','21-50单','50单以上'].map((v) => ({ value: v, label: v }))} placeholder="请选择月均订单数" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">月均开票额 <span className="text-red-500">*</span></label><SearchableSelect value={formData.monthly_invoice_amount || ''} onChange={(value) => handleChange('monthly_invoice_amount', value)} options={['0-5000元','5001-20000元','20001-100000元','100000元以上'].map((v) => ({ value: v, label: v }))} placeholder="请选择月均开票额" /></div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">通关KPI要求 <span className="text-red-500">*</span></label><textarea value={formData.customsKpiRequirement} onChange={(e) => handleChange('customsKpiRequirement', e.target.value)} placeholder="请输入通关KPI要求" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">运输KPI要求 <span className="text-red-500">*</span></label><textarea value={formData.transportKpiRequirement} onChange={(e) => handleChange('transportKpiRequirement', e.target.value)} placeholder="请输入运输KPI要求" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">仓库租赁要求 <span className="text-red-500">*</span></label><textarea value={formData.warehouseLeaseRequirement} onChange={(e) => handleChange('warehouseLeaseRequirement', e.target.value)} placeholder="请输入仓库租赁要求" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化服务需求 <span className="text-red-500">*</span></label><SearchableSelect value={formData.customServiceRequirement || ''} onChange={(value) => handleChange('customServiceRequirement', value)} options={CUSTOM_SERVICE_OPTIONS.map((o) => ({ value: o, label: o }))} placeholder="请选择定制化服务需求" /></div>
                    <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化需求描述 <span className="text-red-500">*</span></label><textarea value={formData.customRequirementDescription} onChange={(e) => handleChange('customRequirementDescription', e.target.value)} placeholder="请输入定制化需求描述" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" /></div>
                  </div>
                </div>
              {/* 合规审核 — 动态结构化字段 */}
              {dynamicFields.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#EBEBEB]">
                    <div className="w-1 h-4 bg-[#0D8A5E] rounded-full" />
                    <h3 className="text-sm font-semibold text-[#0A0A0A]">合规审核</h3>
                    <span className="text-[10px] text-[#999]">不满足条件将触发追加审批人</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {dynamicFields.map((field) => {
                      return (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">
                            {field.name}
                            {field.isRequired && <span className="text-red-500 ml-0.5">*</span>}
                          </label>

                          {field.fieldType === 'boolean' ? (
                            <SearchableSelect
                              value={dynamicFieldValues[field.fieldKey] || ''}
                              onChange={(v) => handleDynamicFieldChange(field.fieldKey, v)}
                              options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                              placeholder={`请选择${field.name}`}
                            />
                          ) : field.fieldType === 'single_select' || field.fieldType === 'number' ? (
                            <SearchableSelect
                              value={dynamicFieldValues[field.fieldKey] || ''}
                              onChange={(v) => handleDynamicFieldChange(field.fieldKey, v)}
                              options={field.options.map(o => ({ value: o.label, label: o.label }))}
                              placeholder={`请选择${field.name}`}
                            />
                          ) : field.fieldType === 'multi_select' ? (
                            <div className="flex flex-wrap gap-1.5">
                              {(dynamicFieldValues[field.fieldKey] || '').split(',').filter(Boolean).map((v, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8EBFF] text-[#2D3BFF] rounded-lg text-sm">
                                  {v}
                                  <button type="button" onClick={() => {
                                    const vals = (dynamicFieldValues[field.fieldKey] || '').split(',').filter(Boolean);
                                    vals.splice(i, 1);
                                    handleDynamicFieldChange(field.fieldKey, vals.join(','));
                                    if (v === '其他') handleDynamicFieldChange(field.fieldKey + '_other', '');
                                  }} className="hover:text-red-500 text-base">×</button>
                                </span>
                              ))}
                              <div className="relative w-full">
                                <SearchableSelect
                                  value=""
                                  onChange={(value) => {
                                    if (!value) return;
                                    const vals = (dynamicFieldValues[field.fieldKey] || '').split(',').filter(Boolean);
                                    if (!vals.includes(value)) vals.push(value);
                                    handleDynamicFieldChange(field.fieldKey, vals.join(','));
                                  }}
                                  options={[
                                    ...field.options.filter(o => !(dynamicFieldValues[field.fieldKey] || '').includes(o.label)).map(o => ({ value: o.label, label: o.label })),
                                    ...((dynamicFieldValues[field.fieldKey] || '').indexOf('其他') === -1 ? [{ value: '其他', label: '其他' }] : []),
                                  ]}
                                  placeholder={`请选择${field.name}`}
                                />
                              </div>
                              {(dynamicFieldValues[field.fieldKey] || '').indexOf('其他') !== -1 && (
                                <input
                                  type="text"
                                  value={dynamicFieldValues[field.fieldKey + '_other'] || ''}
                                  onChange={(e) => handleDynamicFieldChange(field.fieldKey + '_other', e.target.value)}
                                  placeholder="请输入其他地区"
                                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 bg-[#F0F1FF] border border-[#C7CAFF]`}
                                />
                              )}
                            </div>
                          ) : field.fieldType === 'percentage' ? (
                            <div className="relative">
                              <input
                                type="number"
                                value={dynamicFieldValues[field.fieldKey] || ''}
                                onChange={(e) => handleDynamicFieldChange(field.fieldKey, e.target.value)}
                                placeholder={`请输入${field.name}`}
                                className={`w-full rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 bg-[#F0F1FF] border border-[#C7CAFF]`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#999]">%</span>
                            </div>
                          ) : field.fieldType === 'single_other' ? (
                            <div className="space-y-2">
                              <SearchableSelect
                                value={dynamicFieldValues[field.fieldKey] || ''}
                                onChange={(v) => handleDynamicFieldChange(field.fieldKey, v)}
                                options={field.options.map(o => ({ value: o.label, label: o.label }))}
                                placeholder={`请选择${field.name}`}
                              />
                              {dynamicFieldValues[field.fieldKey] === '其他' && (
                                <input
                                  type="text"
                                  value={dynamicFieldValues[field.fieldKey + '_other'] || ''}
                                  onChange={(e) => handleDynamicFieldChange(field.fieldKey + '_other', e.target.value)}
                                  placeholder="请输入其他类型"
                                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 bg-[#F0F1FF] border border-[#C7CAFF]`}
                                />
                              )}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={dynamicFieldValues[field.fieldKey] || ''}
                              onChange={(e) => handleDynamicFieldChange(field.fieldKey, e.target.value)}
                              placeholder={`请输入${field.name}`}
                              className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 bg-[#F0F1FF] border border-[#C7CAFF]`}
                            />
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>

              {/* 右侧审批流 */}
              <div className="col-span-5 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                  {/* 匹配的审批流模板 */}
                  <div className="mb-4 pb-3 border-b border-[#EBEBEB]">
                    <div className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-2">匹配的审批流</div>
                    <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      matchedWorkflow
                        ? 'bg-white border-[#EBEBEB]'
                        : 'bg-[#FFF9EB] border-[#FDE68A]'
                    }`}>
                      <span className="font-semibold text-sm">
                        {matchedWorkflow ? matchedWorkflow.name : '未匹配到模板'}
                      </span>
                      <span className={`text-xs font-medium ${matchedWorkflow ? 'text-[#0D8A5E]' : 'text-[#E8850C]'}`}>
                        {matchedWorkflow ? '已匹配' : '待选择服务产品'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">审批流程</h3>

                  <ApprovalFlowVisual
                    workflow={matchedWorkflow}
                    ruleTriggeredApprovers={ruleTriggeredApprovers}
                    mode="preview"
                    pickedApprover={pickedApprover || undefined}
                  />

                  {currentApproverConfig?.isPickOne && (
                    <div className="mt-4 p-4 bg-[#F5F5F5] rounded-xl">
                      <div className="text-sm font-medium text-[#0A0A0A] mb-2">选择职能审批人</div>
                      <div className="text-xs text-[#999] mb-3">合同物流需要指定一位职能审批人，请从以下人员中选择：</div>
                      <div className="grid grid-cols-2 gap-2">
                        {currentApproverConfig.approvers.map((approver) => (
                          <button key={approver} type="button" onClick={() => handlePickApprover(approver)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${pickedApprover === approver ? 'border-[#2D3BFF] bg-[#E8F4FF]' : 'border-[#EBEBEB] bg-white hover:border-[#2D3BFF]/30'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${pickedApprover === approver ? 'bg-[#2D3BFF] text-white' : 'bg-[#EBEBEB] text-[#999]'}`}>{approver.charAt(0)}</div>
                            <span className={`text-sm font-medium ${pickedApprover === approver ? 'text-[#2D3BFF]' : 'text-[#0A0A0A]'}`}>{approver}</span>
                            {pickedApprover === approver && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D3BFF" strokeWidth="3" className="ml-auto"><polyline points="20 6 9 17 4 12"/></svg>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-[#F5F5F5] rounded-xl">
                    <p className="text-xs text-[#999]">注意: 风控审批中填写的所有字段均不受角色权限限制，所有审批人均可查看全部字段内容。</p>
                  </div>

                  {/* 实时报告 */}
                  {liveReport.items.length > 0 && (
                    <div className="mt-6">
                      <ApprovalReport
                        customerName={formData.companyName || '—'}
                        serviceProduct={formData.serviceProduct || '—'}
                        generatedAt={new Date().toISOString()}
                        items={liveReport.items}
                        passCount={liveReport.passCount}
                        warnCount={liveReport.warnCount}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* 多选弹窗 */}
        {selectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectorOpen('')}>
            <div className="bg-white rounded-2xl w-[480px] max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-[#EBEBEB]">
                <h3 className="text-lg font-semibold text-[#0A0A0A]">{selectorOpen === 'businessCustomer' ? '选择业务主客户' : '选择客户开票信息'}</h3>
                <div className="mt-3 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="搜索..." className="w-full bg-white border border-[#D5D5D5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 focus:border-[#2D3BFF]" />
                </div>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                {(selectorOpen === 'businessCustomer' ? mockBusinessCustomers : mockInvoiceInfos)
                  .filter((item) => ('name' in item ? item.name : 'title' in item ? item.title : '').includes(searchTerm))
                  .map((item) => {
                    const itemId = item.id;
                    const label = 'name' in item ? item.name : 'title' in item ? item.title : '';
                    const selected = selectorOpen === 'businessCustomer' ? (formData.businessCustomerIds || []).includes(itemId) : (formData.invoiceInfoIds || []).includes(itemId);
                    const fieldName = selectorOpen === 'businessCustomer' ? 'businessCustomerIds' as const : 'invoiceInfoIds' as const;
                    return (
                      <button key={itemId} type="button" onClick={() => toggleMultiSelect(fieldName, itemId)} className={`w-full text-left p-3 rounded-xl border transition-colors ${selected ? 'border-[#2D3BFF] bg-[#E8F4FF]' : 'border-[#EBEBEB] hover:bg-[#F5F5F5]'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#0A0A0A]">{label}</span>
                          {selected && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D3BFF" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        {'taxNumber' in item && (item as { taxNumber?: string }).taxNumber && <div className="text-xs text-[#999] mt-1">税号: {(item as { taxNumber?: string }).taxNumber}</div>}
                      </button>
                    );
                  })}
              </div>
              <div className="p-4 border-t border-[#EBEBEB] flex justify-end">
                <button onClick={() => setSelectorOpen('')} className="px-6 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm">确认</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
