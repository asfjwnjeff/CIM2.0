'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

// 常量定义（与新增页面一致）
const SERVICE_PRODUCTS = ['货代', '关务', '仓储', '运输', '进出口', '维修', '合同物流', '其他'];
const BUSINESS_TYPES = ['保税', '口岸完税', '免税', '试单', '其他'];
const MONTHLY_VOLUMES = ['0-50', '51-100', '101-500', '500以上'];
const CUSTOM_SERVICE_OPTIONS = ['信息系统', '运输', '仓储', '财务', '仅涉及标准服务内容'];
const RISK_PURPOSES = ['业务可行性评审', '仅增加结算单位', '仅增加境外收发货人'];
const HMG_RELATIONS = ['客户', '供应商', '最终用户', '结算单位', '内部用户'];

const SERVICE_APPROVERS: Record<string, { approvers: string[]; isPickOne?: boolean }> = {
  '货代': { approvers: ['张洁'] },
  '关务': { approvers: ['蒋总'] },
  '仓储': { approvers: ['吴总'] },
  '运输': { approvers: ['朱弢'] },
  '进出口': { approvers: ['张洁'] },
  '维修': { approvers: ['蒋总'] },
  '合同物流': { approvers: ['张洁', '蒋总', '吴总', '朱弢'], isPickOne: true },
};

const mockBusinessCustomers = [
  { id: 'bc1', name: '应用材料(中国)有限公司' },
  { id: 'bc2', name: '飞雅贸易(上海)有限公司' },
  { id: 'bc3', name: '荏原机械(中国)有限公司' },
  { id: 'bc4', name: '昇先创国际贸易(上海)有限公司' },
  { id: 'bc5', name: '上海华力集成电路制造有限公司' },
  { id: 'bc6', name: '苏斯贸易(上海)有限公司' },
];

const mockInvoiceInfos = [
  { id: 'inv1', title: '8635 - 应用材料(中国)有限公司', taxNumber: '91310000607239088X' },
  { id: 'inv2', title: '8639 - 飞雅贸易(上海)有限公司', taxNumber: '91310000607239089Y' },
  { id: 'inv3', title: '8641 - 荏原机械(中国)有限公司', taxNumber: '91310000607239090Z' },
  { id: 'inv4', title: '8644 - 昇先创国际贸易(上海)有限公司', taxNumber: '91310000607239091A' },
  { id: 'inv5', title: '8603 - 上海华力集成电路制造有限公司', taxNumber: '91310000607239092B' },
];

const mockOpportunities = [
  { id: 'opp1', title: '应用材料-货代服务', customer: '应用材料(中国)有限公司', serviceProduct: '货代' },
  { id: 'opp2', title: '飞雅贸易-仓储服务', customer: '飞雅贸易(上海)有限公司', serviceProduct: '仓储' },
  { id: 'opp3', title: '荏原机械-运输服务', customer: '荏原机械(中国)有限公司', serviceProduct: '运输' },
  { id: 'opp4', title: '昇先创-进出口服务', customer: '昇先创国际贸易(上海)有限公司', serviceProduct: '进出口' },
  { id: 'opp5', title: '上海华力-一体化供应链', customer: '上海华力集成电路制造有限公司', serviceProduct: '合同物流' },
];

// 5条示例数据
const mockApprovals = [
  {
    id: '1',
    status: 'pending',
    isTradeAgent: '是',
    serviceProduct: '货代',
    businessType: '保税',
    goodsType: '半导体设备',
    monthlyBusinessVolume: '101-500',
    monthlyInvoiceAmount: '约50万/月',
    customsKpiRequirement: '通关时效≤24小时，单证准确率≥99.5%',
    transportKpiRequirement: '运输时效≤48小时，货损率≤0.1%',
    warehouseLeaseRequirement: '需常温仓库2000㎡，位于浦东机场附近',
    customServiceRequirement: '信息系统',
    customRequirementDescription: '需要对接客户ERP系统，实现订单自动推送和状态回传',
    companyName: '应用材料(中国)有限公司',
    englishName: 'Applied Materials China Co., Ltd.',
    parentCompany: 'Applied Materials, Inc.',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc1'],
    suggestedSystemCode: 'AMC-2026-001',
    opportunityId: 'opp1',
    invoiceInfoIds: ['inv1'],
    settlementPeriod: '月结30天',
    contactName: '李总',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '王明' },
      { id: 'func', name: '职能审批', role: '货代职能审批人', status: 'current', approver: '张洁' },
      { id: 'baili', name: '白沥审批', role: '贸易代理专员', status: 'pending', approver: '白沥', isAutoAdded: true, autoAddReason: '贸易代理自动添加' },
      { id: 'mgmt', name: '管理层审批', role: '部门经理', status: 'pending', approver: '陈总' },
      { id: 'fin', name: '财务确认', role: '财务部', status: 'pending', approver: '赵总监' },
    ],
  },
  {
    id: '2',
    status: 'approved',
    isTradeAgent: '否',
    serviceProduct: '仓储',
    businessType: '口岸完税',
    goodsType: '电子元器件',
    monthlyBusinessVolume: '51-100',
    monthlyInvoiceAmount: '约30万/月',
    customsKpiRequirement: '无特殊要求',
    transportKpiRequirement: '无特殊要求',
    warehouseLeaseRequirement: '需恒温恒湿仓库500㎡，位于外高桥保税区',
    customServiceRequirement: '仓储',
    customRequirementDescription: '需要VMI库存管理服务，支持按需出库',
    companyName: '飞雅贸易(上海)有限公司',
    englishName: 'Fiya Trading (Shanghai) Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '飞雅贸易深圳分公司',
    riskControlPurpose: '仅增加结算单位',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc2'],
    suggestedSystemCode: 'FYC-2026-002',
    opportunityId: 'opp2',
    invoiceInfoIds: ['inv2'],
    settlementPeriod: '月结45天',
    contactName: '王经理',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '王明' },
      { id: 'func', name: '职能审批', role: '仓储职能审批人', status: 'completed', approver: '吴总' },
      { id: 'mgmt', name: '管理层审批', role: '部门经理', status: 'completed', approver: '陈总' },
      { id: 'fin', name: '财务确认', role: '财务部', status: 'completed', approver: '赵总监' },
    ],
  },
  {
    id: '3',
    status: 'in_review',
    isTradeAgent: '是',
    serviceProduct: '运输',
    businessType: '免税',
    goodsType: '精密仪器',
    monthlyBusinessVolume: '0-50',
    monthlyInvoiceAmount: '约15万/月',
    customsKpiRequirement: '通关时效≤12小时，需AEO认证通道',
    transportKpiRequirement: '运输时效≤24小时，需全程GPS跟踪，货损率≤0.05%',
    warehouseLeaseRequirement: '需临时中转仓300㎡，位于虹桥机场附近',
    customServiceRequirement: '运输',
    customRequirementDescription: '需要专车运输服务，配备防震设备和温控系统',
    companyName: '荏原机械(中国)有限公司',
    englishName: 'Ebara Machinery China Co., Ltd.',
    parentCompany: '荏原制作所',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc3'],
    suggestedSystemCode: 'YBJ-2026-003',
    opportunityId: 'opp3',
    invoiceInfoIds: ['inv3'],
    settlementPeriod: '月结60天',
    contactName: '张总监',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '刘芳' },
      { id: 'func', name: '职能审批', role: '运输职能审批人', status: 'completed', approver: '朱弢' },
      { id: 'baili', name: '白沥审批', role: '贸易代理专员', status: 'current', approver: '白沥', isAutoAdded: true, autoAddReason: '贸易代理自动添加' },
      { id: 'mgmt', name: '管理层审批', role: '部门经理', status: 'pending', approver: '陈总' },
      { id: 'fin', name: '财务确认', role: '财务部', status: 'pending', approver: '赵总监' },
    ],
  },
  {
    id: '4',
    status: 'draft',
    isTradeAgent: '否',
    serviceProduct: '进出口',
    businessType: '试单',
    goodsType: '化工原料',
    monthlyBusinessVolume: '500以上',
    monthlyInvoiceAmount: '约100万/月',
    customsKpiRequirement: '通关时效≤6小时，需危化品通关资质',
    transportKpiRequirement: '运输需危化品运输资质，全程温控监测',
    warehouseLeaseRequirement: '需危化品专用仓库1000㎡，甲类资质',
    customServiceRequirement: '仅涉及标准服务内容',
    customRequirementDescription: '无特殊定制化需求',
    companyName: '昇先创国际贸易(上海)有限公司',
    englishName: 'Sunson International Trading Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '',
    riskControlPurpose: '仅增加境外收发货人',
    relationshipWithHMG: '供应商',
    businessCustomerIds: ['bc4', 'bc6'],
    suggestedSystemCode: 'SXC-2026-004',
    opportunityId: 'opp4',
    invoiceInfoIds: ['inv4'],
    settlementPeriod: '月结30天',
    contactName: '陈主管',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'current', approver: '李强' },
      { id: 'func', name: '职能审批', role: '进出口职能审批人', status: 'pending', approver: '张洁' },
      { id: 'mgmt', name: '管理层审批', role: '部门经理', status: 'pending', approver: '陈总' },
      { id: 'fin', name: '财务确认', role: '财务部', status: 'pending', approver: '赵总监' },
    ],
  },
  {
    id: '5',
    status: 'rejected',
    isTradeAgent: '否',
    serviceProduct: '合同物流',
    businessType: '保税',
    goodsType: '集成电路芯片',
    monthlyBusinessVolume: '101-500',
    monthlyInvoiceAmount: '约80万/月',
    customsKpiRequirement: '通关时效≤4小时，需无纸化通关',
    transportKpiRequirement: '运输时效≤12小时，需恒温运输',
    warehouseLeaseRequirement: '需洁净仓库3000㎡，无尘环境',
    customServiceRequirement: '信息系统',
    customRequirementDescription: '需要WMS/TMS系统对接，实现库存和运输全程可视化',
    companyName: '上海华力集成电路制造有限公司',
    englishName: 'Shanghai Huahong Grace Semiconductor Co., Ltd.',
    parentCompany: '华虹集团',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc5'],
    suggestedSystemCode: 'HHL-2026-005',
    opportunityId: 'opp5',
    invoiceInfoIds: ['inv5'],
    settlementPeriod: '月结15天',
    contactName: '赵副总',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '周华' },
      { id: 'func', name: '职能审批', role: '合同物流职能审批人（四选一）', status: 'completed', approver: '蒋总', approvers: ['张洁', '蒋总', '吴总', '朱弢'] },
      { id: 'mgmt', name: '管理层审批', role: '部门经理', status: 'completed', approver: '陈总' },
      { id: 'fin', name: '财务确认', role: '财务部', status: 'completed', approver: '赵总监', rejected: true },
    ],
  },
];

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: '草稿', bg: 'bg-[#EBEBEB]', text: 'text-[#999]' },
  pending: { label: '待审批', bg: 'bg-[#FEFCE8]', text: 'text-[#CA8A04]' },
  in_review: { label: '审批中', bg: 'bg-[#E8F4FF]', text: 'text-[#2D3BFF]' },
  approved: { label: '已通过', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  rejected: { label: '已拒绝', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
};

export default function ApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const approval = mockApprovals.find((a) => a.id === id) || mockApprovals[0];
  const statusInfo = STATUS_MAP[approval.status] || STATUS_MAP.draft;

  const getSelectedNames = (ids: string[], list: { id: string; name?: string; title?: string }[]) => {
    return ids.map((itemId: string) => list.find((item) => item.id === itemId)?.name || list.find((item) => item.id === itemId)?.title || itemId);
  };

  const opportunityTitle = mockOpportunities.find((o) => o.id === approval.opportunityId)?.title || approval.opportunityId;

  return (
    <AppLayout>
      <div className="p-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push('/approvals')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">风控审批详情</h1>
            <p className="text-[#5A5A5A] mt-1">查看客户风险控制审批申请详情和审批流程</p>
          </div>
          <div className="flex-1" />
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
          <button onClick={() => router.push(`/approvals/${id}/edit`)} className="px-6 py-2 bg-[#2D3BFF] text-white rounded-lg hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all">编辑</button>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-12 gap-6">
            {/* 左侧主区域 */}
            <div className="col-span-7 space-y-6">
              {/* 公司信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">公司信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">公司全称 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.companyName}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">英文名称</label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.englishName || '-'}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">集团（母）公司名称</label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.parentCompany || '-'}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">分（子）公司名称</label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.subsidiaryCompany || '-'}</div></div>
                </div>
              </div>

              {/* 风控信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">风控信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">风险控制目的 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.riskControlPurpose}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">此公司与HMG的关系 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.relationshipWithHMG}</div></div>
                </div>
              </div>

              {/* 关联信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">关联信息</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">业务主客户 <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedNames(approval.businessCustomerIds, mockBusinessCustomers.map((c) => ({ id: c.id, name: c.name }))).map((name, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 bg-[#E8F4FF] text-[#2D3BFF] rounded-full text-xs">{name}</span>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">建议系统代码 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.suggestedSystemCode}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">商机 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#2D3BFF]">{opportunityTitle}</div></div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">客户开票信息 <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedNames(approval.invoiceInfoIds, mockInvoiceInfos.map((inv) => ({ id: inv.id, name: inv.title }))).map((name, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 bg-[#FFF7ED] text-[#EA580C] rounded-full text-xs">{name}</span>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">结算账期 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.settlementPeriod}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">联系人 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.contactName}</div></div>
                </div>
              </div>

              {/* 业务信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">业务信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">是否涉及贸易代理 <span className="text-red-500">*</span></label><div className={`w-full rounded-xl px-4 py-3 text-sm font-medium ${approval.isTradeAgent === '是' ? 'bg-[#FEFCE8] text-[#CA8A04]' : 'bg-[#F5F5F5] text-[#0A0A0A]'}`}>{approval.isTradeAgent}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">服务产品 <span className="text-red-500">*</span></label><div className="w-full bg-[#E8F4FF] text-[#2D3BFF] rounded-xl px-4 py-3 text-sm font-medium">{approval.serviceProduct}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">业务类型 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.businessType}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">货物类型 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.goodsType}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">月均业务量 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.monthlyBusinessVolume}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">每月开票金额 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.monthlyInvoiceAmount}</div></div>
                </div>
                <div className="mt-4 space-y-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">通关KPI要求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.customsKpiRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">运输KPI要求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.transportKpiRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">仓库租赁要求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.warehouseLeaseRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化服务需求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.customServiceRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化需求描述 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.customRequirementDescription}</div></div>
                </div>
              </div>
            </div>

            {/* 右侧审批流 */}
            <div className="col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">审批流程</h3>
                <div className="space-y-0">
                  {approval.approvalSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          step.status === 'completed' ? 'bg-[#16A34A] text-white' :
                          step.status === 'current' ? 'bg-[#2D3BFF] text-white' :
                          'bg-[#EBEBEB] text-[#999]'
                        }`}>
                          {'rejected' in step && step.rejected ? '✕' : index + 1}
                        </div>
                        {index < approval.approvalSteps.length - 1 && <div className="w-0.5 h-12 bg-[#EBEBEB]" />}
                      </div>
                      <div className="pb-8 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0A0A0A]">{step.name}</span>
                          {'rejected' in step && step.rejected && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-[#FEF2F2] text-[#DC2626] text-xs rounded-full font-medium">已拒绝</span>
                          )}
                        </div>
                        <div className="text-xs text-[#999] mt-0.5">{step.role}</div>
                        {step.approver && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#E8F4FF] flex items-center justify-center text-[10px] font-medium text-[#2D3BFF]">
                              {step.approver.charAt(0)}
                            </div>
                            <span className="text-xs text-[#666]">{step.approver}</span>
                          </div>
                        )}
                        {'approvers' in step && step.approvers && step.approvers.length > 1 && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {step.approvers.map((a: string) => (
                              <div key={a} className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${a === step.approver ? 'bg-[#2D3BFF]' : 'bg-[#E8F4FF]'}`}>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${a === step.approver ? 'bg-white text-[#2D3BFF]' : 'bg-[#2D3BFF] text-white'}`}>{a.charAt(0)}</div>
                                <span className={`text-xs ${a === step.approver ? 'text-white' : 'text-[#2D3BFF]'}`}>{a}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {'isAutoAdded' in step && step.isAutoAdded && 'autoAddReason' in step && step.autoAddReason && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-[#FEFCE8] text-[#CA8A04] text-xs rounded-full">{step.autoAddReason}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-[#F5F5F5] rounded-xl">
                  <p className="text-xs text-[#999]">注意: 风控审批中填写的所有字段均不受角色权限限制，所有审批人均可查看全部字段内容。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
