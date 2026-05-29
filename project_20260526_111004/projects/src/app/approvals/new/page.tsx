"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useApp } from '@/lib/store';
import { RuleTriggeredApprover, ServiceProduct } from '@/lib/types';
import ApprovalFlowVisual from '@/components/ApprovalFlowVisual';

// 选项配置
const SERVICE_PRODUCTS = ["货代", "关务", "仓库", "运输", "进出口", "维修", "合同物流", "一体化供应链", "其他"];
const BUSINESS_TYPES = ["保税", "口岸完税", "免税", "试单", "其他"];
const MONTHLY_VOLUMES = ["0-50", "51-100", "101-500", "500以上"];
const CUSTOM_SERVICE_OPTIONS = ["信息系统", "运输", "仓储", "财务", "仅涉及标准服务内容"];
const RISK_PURPOSES = ["业务可行性评审", "仅增加结算单位", "仅增加境外收发货人"];
const HMG_RELATIONS = ["客户", "供应商", "最终用户", "结算单位", "内部用户"];

// 模拟数据
const mockBusinessCustomers = [
  { id: "1", name: "武汉光库科技有限公司" },
  { id: "2", name: "江苏鑫华半导体科技股份有限公司" },
  { id: "3", name: "上海裘瑞经贸有限公司" },
  { id: "4", name: "精诚（中国）企业管理有限公司" },
  { id: "5", name: "卡尔蔡司（上海）管理有限公司" },
];

const mockOpportunities = [
  { id: "1", title: "武汉光库+武汉+归类服务", customer: "武汉光库", serviceProduct: "关务" },
  { id: "2", title: "江苏鑫华+临港常温仓储业务", customer: "江苏鑫华", serviceProduct: "仓储" },
  { id: "3", title: "上海裘瑞+贸易代理", customer: "上海裘瑞", serviceProduct: "进出口" },
  { id: "4", title: "应用材料+货代+半导体设备物流", customer: "应用材料", serviceProduct: "货代" },
  { id: "5", title: "飞雅贸易+仓储+电子产品进口", customer: "飞雅贸易", serviceProduct: "仓储" },
];

const mockInvoiceInfos = [
  { id: "1", title: "武汉光库科技有限公司", taxNumber: "914201007713589677" },
  { id: "2", title: "江苏鑫华半导体科技股份有限公司", taxNumber: "91320301MA1MCPLL8F" },
  { id: "3", title: "上海裘瑞经贸有限公司", taxNumber: "91310118738523211W" },
];

export default function NewRiskControlPage() {
  const router = useRouter();
  const { approvalFields, approvalWorkflows } = useApp();

  const [formData, setFormData] = useState({
    isTradeAgent: "",
    serviceProduct: "",
    businessType: "",
    goodsType: "",
    monthlyBusinessVolume: "",
    monthlyInvoiceAmount: "",
    customsKpiRequirement: "",
    transportKpiRequirement: "",
    warehouseLeaseRequirement: "",
    customServiceRequirement: "",
    customRequirementDescription: "",
    companyName: "",
    englishName: "",
    parentCompany: "",
    subsidiaryCompany: "",
    riskControlPurpose: "",
    relationshipWithHMG: "",
    businessCustomerIds: [] as string[],
    suggestedSystemCode: "",
    opportunityId: "",
    invoiceInfoIds: [] as string[],
    settlementPeriod: "",
    contactName: "",
  });

  const [selectorOpen, setSelectorOpen] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [opportunitySearch, setOpportunitySearch] = useState("");
  const [showOpportunityDropdown, setShowOpportunityDropdown] = useState(false);

  // 动态字段值存储
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});

  // 根据服务产品获取动态字段（排除\"是否贸易代理\"，它是固定字段）
  const dynamicFields = useMemo(() => {
    if (!formData.serviceProduct) return [];
    return approvalFields.filter(
      f => f.status === 'active' && f.serviceProducts.includes(formData.serviceProduct as ServiceProduct) && f.fieldKey !== 'is_trade_agent'
    );
  }, [approvalFields, formData.serviceProduct]);

  // 匹配审批流模板
  const matchedWorkflow = useMemo(() => {
    if (!formData.serviceProduct) return null;
    return approvalWorkflows.find(
      w => w.status === 'active' && w.serviceProduct === formData.serviceProduct
    ) || null;
  }, [approvalWorkflows, formData.serviceProduct]);

  // 模拟规则触发的审批人
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

  const handleDynamicFieldChange = (fieldKey: string, value: string) => {
    setDynamicFieldValues(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelect = (name: "businessCustomerIds" | "invoiceInfoIds", id: string) => {
    setFormData((prev) => {
      const current = prev[name];
      const next = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
      return { ...prev, [name]: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("提交成功！");
    router.push("/approvals");
  };

  const handleSaveDraft = () => {
    alert("暂存成功！");
  };

  const handleCancel = () => {
    router.push("/approvals");
  };

  const getSelectedNames = (name: "businessCustomerIds" | "invoiceInfoIds", list: { id: string; name?: string; title?: string }[]) => {
    return formData[name].map((id: string) => list.find((item) => item.id === id)?.name || list.find((item) => item.id === id)?.title || id);
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">新建风控审批</h1>
            <p className="text-[#5A5A5A] mt-1">创建新的客户风险控制审批申请，填写业务和风控信息</p>
          </div>
          <div className="flex-1" />
          <button onClick={handleSaveDraft} className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-[#666] hover:bg-gray-50">暂存</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-[#2D3BFF] text-white rounded-lg hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all">提交</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-12 gap-6">
            {/* 左侧主区域 */}
            <div className="col-span-7 space-y-6">
              {/* 公司信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">公司信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">公司全称 <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} placeholder="签约名称" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">英文名称</label>
                    <input type="text" value={formData.englishName} onChange={(e) => handleChange("englishName", e.target.value)} placeholder="境外客户必填" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">集团（母）公司名称</label>
                    <input type="text" value={formData.parentCompany} onChange={(e) => handleChange("parentCompany", e.target.value)} placeholder="请输入集团（母）公司名称" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">分（子）公司名称</label>
                    <input type="text" value={formData.subsidiaryCompany} onChange={(e) => handleChange("subsidiaryCompany", e.target.value)} placeholder="请输入分（子）公司名称" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                </div>
              </div>

              {/* 风控信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">风控信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">风险控制目的 <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      value={formData.riskControlPurpose}
                      onChange={(value) => handleChange("riskControlPurpose", value)}
                      options={RISK_PURPOSES.map((p) => ({ value: p, label: p }))}
                      placeholder="请选择风险控制目的"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">此公司与HMG的关系 <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      value={formData.relationshipWithHMG}
                      onChange={(value) => handleChange("relationshipWithHMG", value)}
                      options={HMG_RELATIONS.map((r) => ({ value: r, label: r }))}
                      placeholder="请选择关系"
                    />
                  </div>
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
                        {getSelectedNames("businessCustomerIds", mockBusinessCustomers.map((c) => ({ id: c.id, name: c.name }))).map((name, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F4FF] text-[#2D3BFF] rounded-lg text-sm">
                            {name}
                            <button type="button" onClick={() => toggleMultiSelect("businessCustomerIds", formData.businessCustomerIds[i])} className="hover:text-red-500 text-base">×</button>
                          </span>
                        ))}
                      </div>
                      <button type="button" onClick={() => { setSearchTerm(""); setSelectorOpen("businessCustomer"); }} className="w-full bg-white border border-dashed border-[#D5D5D5] rounded-xl px-4 py-3 text-sm text-[#999] hover:border-[#2D3BFF] hover:text-[#2D3BFF] transition-colors">+ 选择业务主客户</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">建议系统代码 <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.suggestedSystemCode} onChange={(e) => handleChange("suggestedSystemCode", e.target.value)} placeholder="请输入建议系统代码" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">商机 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={opportunitySearch} onChange={(e) => { setOpportunitySearch(e.target.value); setShowOpportunityDropdown(true); }} onFocus={() => setShowOpportunityDropdown(true)} placeholder="搜索并选择商机" className="w-full bg-white border border-[#D5D5D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 focus:border-[#2D3BFF]" />
                      {formData.opportunityId && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          <span className="text-sm text-[#2D3BFF] bg-[#E8F4FF] px-3 py-1 rounded-lg">
                            {mockOpportunities.find((o) => o.id === formData.opportunityId)?.title}
                          </span>
                        </div>
                      )}
                      <button type="button" onClick={() => setShowOpportunityDropdown(!showOpportunityDropdown)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      {showOpportunityDropdown && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-auto">
                          {mockOpportunities.filter((o) => o.title.toLowerCase().includes(opportunitySearch.toLowerCase()) || o.customer.toLowerCase().includes(opportunitySearch.toLowerCase())).length === 0 ? (
                            <div className="px-4 py-3 text-sm text-[#999999]">无匹配结果</div>
                          ) : (
                            mockOpportunities.filter((o) => o.title.toLowerCase().includes(opportunitySearch.toLowerCase()) || o.customer.toLowerCase().includes(opportunitySearch.toLowerCase())).map((o) => (
                              <button key={o.id} type="button" onClick={() => { handleChange("opportunityId", o.id); setOpportunitySearch(""); setShowOpportunityDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors ${formData.opportunityId === o.id ? "bg-[#E8F4FF] text-[#2D3BFF]" : "text-[#0A0A0A]"}`}>
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
                        {getSelectedNames("invoiceInfoIds", mockInvoiceInfos.map((inv) => ({ id: inv.id, name: inv.title }))).map((name, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF7ED] text-[#EA580C] rounded-lg text-sm">
                            {name}
                            <button type="button" onClick={() => toggleMultiSelect("invoiceInfoIds", formData.invoiceInfoIds[i])} className="hover:text-red-500 text-base">×</button>
                          </span>
                        ))}
                      </div>
                      <button type="button" onClick={() => { setSearchTerm(""); setSelectorOpen("invoiceInfo"); }} className="w-full bg-white border border-dashed border-[#D5D5D5] rounded-xl px-4 py-3 text-sm text-[#999] hover:border-[#2D3BFF] hover:text-[#2D3BFF] transition-colors">+ 选择客户开票信息</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">结算账期 <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.settlementPeriod} onChange={(e) => handleChange("settlementPeriod", e.target.value)} placeholder="请输入结算账期" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">联系人 <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.contactName} onChange={(e) => handleChange("contactName", e.target.value)} placeholder="请输入联系人" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                </div>
              </div>

              {/* 业务信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">业务信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">是否涉及贸易代理 <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      value={formData.isTradeAgent}
                      onChange={(value) => handleChange("isTradeAgent", value)}
                      options={[{ value: "是", label: "是" }, { value: "否", label: "否" }]}
                      placeholder="请选择"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">服务产品 <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      value={formData.serviceProduct}
                      onChange={(value) => handleChange("serviceProduct", value)}
                      options={SERVICE_PRODUCTS.map((p) => ({ value: p, label: p }))}
                      placeholder="请选择服务产品"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">业务类型 <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      value={formData.businessType}
                      onChange={(value) => handleChange("businessType", value)}
                      options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
                      placeholder="请选择业务类型"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">货物类型 <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.goodsType} onChange={(e) => handleChange("goodsType", e.target.value)} placeholder="请输入货物类型" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">月均业务量 <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      value={formData.monthlyBusinessVolume}
                      onChange={(value) => handleChange("monthlyBusinessVolume", value)}
                      options={MONTHLY_VOLUMES.map((v) => ({ value: v, label: v }))}
                      placeholder="请选择月均业务量"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">每月开票金额 <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.monthlyInvoiceAmount} onChange={(e) => handleChange("monthlyInvoiceAmount", e.target.value)} placeholder="请输入每月开票金额" className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30" />
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">通关KPI要求 <span className="text-red-500">*</span></label>
                    <textarea value={formData.customsKpiRequirement} onChange={(e) => handleChange("customsKpiRequirement", e.target.value)} placeholder="请输入通关KPI要求" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">运输KPI要求 <span className="text-red-500">*</span></label>
                    <textarea value={formData.transportKpiRequirement} onChange={(e) => handleChange("transportKpiRequirement", e.target.value)} placeholder="请输入运输KPI要求" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">仓库租赁要求 <span className="text-red-500">*</span></label>
                    <textarea value={formData.warehouseLeaseRequirement} onChange={(e) => handleChange("warehouseLeaseRequirement", e.target.value)} placeholder="请输入仓库租赁要求" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化服务需求 <span className="text-red-500">*</span></label>
                    <SearchableSelect
                      value={formData.customServiceRequirement}
                      onChange={(value) => handleChange("customServiceRequirement", value)}
                      options={CUSTOM_SERVICE_OPTIONS.map((o) => ({ value: o, label: o }))}
                      placeholder="请选择定制化服务需求"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化需求描述 <span className="text-red-500">*</span></label>
                    <textarea value={formData.customRequirementDescription} onChange={(e) => handleChange("customRequirementDescription", e.target.value)} placeholder="请输入定制化需求描述" rows={3} className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none" />
                  </div>
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
                      const isTradeAgentField = field.fieldKey === 'is_trade_agent';
                      const isTradeAgentYes = isTradeAgentField && dynamicFieldValues[field.fieldKey] === '是';
                      const inputBg = isTradeAgentYes
                        ? 'bg-[#FFF9EB] border border-[#E8850C]'
                        : 'bg-[#F0F1FF] border border-[#C7CAFF]';

                      return (
                        <div key={field.id} className={field.fieldType === 'boolean' || field.fieldKey === 'shipping_country' ? '' : ''}>
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
                          ) : field.fieldType === 'single_select' || field.fieldType === 'number_select' ? (
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
                                  }} className="hover:text-red-500 text-base">×</button>
                                </span>
                              ))}
                              <div className="relative w-full">
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (!e.target.value) return;
                                    const vals = (dynamicFieldValues[field.fieldKey] || '').split(',').filter(Boolean);
                                    if (!vals.includes(e.target.value)) vals.push(e.target.value);
                                    handleDynamicFieldChange(field.fieldKey, vals.join(','));
                                  }}
                                  className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 ${inputBg}`}
                                >
                                  <option value="">{`请选择${field.name}`}</option>
                                  {field.options.filter(o => !(dynamicFieldValues[field.fieldKey] || '').includes(o.label)).map(o => (
                                    <option key={o.id} value={o.label}>{o.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={dynamicFieldValues[field.fieldKey] || ''}
                              onChange={(e) => handleDynamicFieldChange(field.fieldKey, e.target.value)}
                              placeholder={`请输入${field.name}`}
                              className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 ${inputBg}`}
                            />
                          )}

                          {isTradeAgentYes && (
                            <p className="text-[10px] text-[#E8850C] mt-1">触发追加审批人</p>
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
                />

                <div className="mt-4 p-3 bg-[#F5F5F5] rounded-xl">
                  <p className="text-xs text-[#999]">注意: 风控审批中填写的所有字段均不受角色权限限制，所有审批人均可查看全部字段内容。</p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* 多选弹窗 */}
        {selectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectorOpen("")}>
            <div className="bg-white rounded-2xl w-[480px] max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-[#EBEBEB]">
                <h3 className="text-lg font-semibold text-[#0A0A0A]">
                  {selectorOpen === "businessCustomer" ? "选择业务主客户" : "选择客户开票信息"}
                </h3>
                <div className="mt-3 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="搜索..." className="w-full bg-white border border-[#D5D5D5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 focus:border-[#2D3BFF]" />
                </div>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                {(selectorOpen === "businessCustomer" ? mockBusinessCustomers : mockInvoiceInfos)
                  .filter((item) => ("name" in item ? item.name : "title" in item ? item.title : "").includes(searchTerm))
                  .map((item) => {
                    const id = item.id;
                    const label = "name" in item ? item.name : "title" in item ? item.title : "";
                    const selected = selectorOpen === "businessCustomer" ? formData.businessCustomerIds.includes(id) : formData.invoiceInfoIds.includes(id);
                    const fieldName = selectorOpen === "businessCustomer" ? "businessCustomerIds" as const : "invoiceInfoIds" as const;
                    return (
                      <button key={id} type="button" onClick={() => toggleMultiSelect(fieldName, id)} className={`w-full text-left p-3 rounded-xl border transition-colors ${selected ? "border-[#2D3BFF] bg-[#E8F4FF]" : "border-[#EBEBEB] hover:bg-[#F5F5F5]"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#0A0A0A]">{label}</span>
                          {selected && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D3BFF" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        {"taxNumber" in item && (item as { taxNumber?: string }).taxNumber && <div className="text-xs text-[#999] mt-1">税号: {(item as { taxNumber?: string }).taxNumber}</div>}
                      </button>
                    );
                  })}
              </div>
              <div className="p-4 border-t border-[#EBEBEB] flex justify-end">
                <button onClick={() => setSelectorOpen("")} className="px-6 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm">确认</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
