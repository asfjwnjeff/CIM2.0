'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { useGroupFilter, GroupTabs, GroupManageDialog } from '@/components/groups';
import { FIELD_META_MAP } from '@/lib/group-utils';

// 客户风险控制数据类型
interface RiskControl {
  id: string;
  companyName: string;
  englishName?: string;
  parentCompanyName?: string;
  subsidiaryCompanyName?: string;
  riskControlPurpose: string;
  relationshipWithHMG: string;
  businessCustomerName: string;
  businessCustomerCountry: string;
  industryChainType: string;
  supplyChainRole: string;
  crossBorderMode: string;
  customerChannel: string;
  unifiedSocialCreditCode: string;
  superiorCustomer?: string;
  suggestedSystemCode: string;
  opportunityName: string;
  opportunityTitle: string;
  invoiceTitle: string;
  taxId: string;
  rmbBank?: string;
  rmbAccount?: string;
  usdBank?: string;
  settlementPeriod: string;
  contactName: string;
  contactPhone?: string;
  isKeyDecisionMaker: boolean;
  contactEmail?: string;
  contactDepartment?: string;
  contactPosition?: string;
  involvesTradeAgent: boolean;
  serviceProduct: string;
  businessType: string;
  other?: string;
  ourEntity?: string;
  goodsType: string;
  monthlyBusinessVolume: string;
  monthlyInvoiceAmount: string;
  customsKpiRequirement: string;
  transportKpiRequirement: string;
  warehouseRentalRequirement: string;
  customizedServiceRequirement: string;
  customizedRequirementDescription: string;
  trialOrderAttachment?: string;
  approvalStatus: string;
  approvalResult?: string;
  currentNode?: string;
  currentApprover?: string;
  historicalApprovers?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 示例数据 - 5条
const mockRiskControls: RiskControl[] = [
  {
    id: '1',
    companyName: '武汉光库科技有限公司',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerName: '武汉光库科技有限公司',
    businessCustomerCountry: '中企',
    industryChainType: '设计研发',
    supplyChainRole: '供应商',
    crossBorderMode: '其他',
    customerChannel: '直客',
    unifiedSocialCreditCode: '914201007713589677',
    suggestedSystemCode: 'WHGK',
    opportunityName: '武汉光库科技有限公司+武汉+归类服务',
    opportunityTitle: '武汉光库科技有限公司+武汉+归类服务',
    invoiceTitle: '武汉光库科技有限公司',
    taxId: '914201007713589677',
    rmbBank: '中国工商银行武汉光谷大道支行',
    rmbAccount: '3202223519100166124',
    settlementPeriod: '60天',
    contactName: '高燕',
    contactPhone: '+86-15914106411',
    isKeyDecisionMaker: true,
    contactEmail: 'Ella.Gao@fiber-resources.com',
    contactDepartment: '关务',
    contactPosition: '主管',
    involvesTradeAgent: false,
    serviceProduct: '关务',
    businessType: '保税',
    ourEntity: '光电子元器件、光模块',
    goodsType: '光电子元器件、光模块',
    monthlyBusinessVolume: '0-50',
    monthlyInvoiceAmount: '50000',
    customsKpiRequirement: '两周内完成1200个物料的归类梳理',
    transportKpiRequirement: '合同不涉及',
    warehouseRentalRequirement: '暂时不涉及',
    customizedServiceRequirement: '仅涉及标准服务内容',
    customizedRequirementDescription: '暂时不涉及',
    approvalStatus: '审批中',
    currentNode: '职能审批',
    currentApprover: '蒋总',
    createdAt: '2026-04-30 15:34',
    updatedAt: '2026-04-30 16:45',
    createdBy: '王健',
    updatedBy: '吴佳敏',
  },
  {
    id: '2',
    companyName: '江苏鑫华半导体科技股份有限公司',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerName: '江苏鑫华半导体科技股份有限公司',
    businessCustomerCountry: '中企',
    industryChainType: '设计研发',
    supplyChainRole: '供应商',
    crossBorderMode: '普通仓库',
    customerChannel: '直客',
    unifiedSocialCreditCode: '91320301MA1MCPLL8F',
    suggestedSystemCode: 'XHBDT',
    opportunityName: '江苏鑫华半导体科技股份有限公司临港常温仓储业务',
    opportunityTitle: '临港常温仓储业务',
    invoiceTitle: '江苏鑫华半导体科技股份有限公司',
    taxId: '91320301MA1MCPLL8F',
    rmbBank: '江苏银行徐州宣武支行',
    rmbAccount: '60250188000089526',
    settlementPeriod: '30天',
    contactName: '张正阳',
    contactPhone: '+86-18168762777',
    isKeyDecisionMaker: false,
    contactPosition: '经理',
    involvesTradeAgent: false,
    serviceProduct: '仓储',
    businessType: '保税',
    ourEntity: '多晶硅',
    goodsType: '多晶硅',
    monthlyBusinessVolume: '51-100',
    monthlyInvoiceAmount: '80000',
    customsKpiRequirement: '/',
    transportKpiRequirement: '/',
    warehouseRentalRequirement: '临港600平常温库区存储，一周2次，每次36托进出库操作服务。',
    customizedServiceRequirement: '仅涉及标准服务内容',
    customizedRequirementDescription: '/',
    approvalStatus: '审批中',
    currentNode: '职能审批',
    currentApprover: '吴总',
    createdAt: '2026-04-29 16:05',
    updatedAt: '2026-04-30 13:59',
    createdBy: '倪萍',
    updatedBy: '吴佳敏',
  },
  {
    id: '3',
    companyName: '上海裘瑞经贸有限公司',
    riskControlPurpose: '仅增加结算单位',
    relationshipWithHMG: '客户',
    businessCustomerName: '上海裘瑞经贸有限公司',
    businessCustomerCountry: '中企',
    industryChainType: '商贸服务',
    supplyChainRole: '中间商',
    crossBorderMode: '口岸',
    customerChannel: '直客',
    unifiedSocialCreditCode: '91310118738523211W',
    suggestedSystemCode: 'QRJM',
    opportunityName: '上海裘瑞经贸有限公司贸易代理',
    opportunityTitle: '贸易代理',
    invoiceTitle: '上海裘瑞经贸有限公司',
    taxId: '91310118738523211W',
    settlementPeriod: '60天',
    contactName: '丁慧',
    isKeyDecisionMaker: false,
    contactDepartment: '商务部',
    contactPosition: '经理',
    involvesTradeAgent: true,
    serviceProduct: '货代',
    businessType: '口岸完税',
    goodsType: '文具',
    monthlyBusinessVolume: '0-50',
    monthlyInvoiceAmount: '120000',
    customsKpiRequirement: '无',
    transportKpiRequirement: '无',
    warehouseRentalRequirement: '无',
    customizedServiceRequirement: '仅涉及标准服务内容',
    customizedRequirementDescription: '无',
    approvalStatus: '审批完成',
    approvalResult: '已同意',
    historicalApprovers: '陆静娥,龚重濛,白沥,吴佳敏',
    createdAt: '2026-04-29 09:18',
    updatedAt: '2026-05-06 14:04',
    createdBy: '夏赟帆',
    updatedBy: '龚重濛',
  },
  {
    id: '4',
    companyName: '应用材料(中国)有限公司',
    englishName: 'Applied Materials China Co., Ltd.',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerName: '应用材料(中国)有限公司',
    businessCustomerCountry: '外企',
    industryChainType: '设计研发',
    supplyChainRole: '最终用户',
    crossBorderMode: '保税',
    customerChannel: '直客',
    unifiedSocialCreditCode: '9131011560723902XM',
    suggestedSystemCode: 'AMC',
    opportunityName: '应用材料半导体设备进口运输项目',
    opportunityTitle: '半导体设备进口运输项目',
    invoiceTitle: '应用材料(中国)有限公司',
    taxId: '9131011560723902XM',
    settlementPeriod: '45天',
    contactName: '李总',
    contactPhone: '+86-13800138001',
    isKeyDecisionMaker: true,
    contactEmail: 'li@appliedmaterials.com',
    contactDepartment: '采购部',
    contactPosition: '总监',
    involvesTradeAgent: true,
    serviceProduct: '运输',
    businessType: '保税',
    goodsType: '半导体设备',
    monthlyBusinessVolume: '101-500',
    monthlyInvoiceAmount: '500000',
    customsKpiRequirement: '48小时内完成清关',
    transportKpiRequirement: '门到门运输，温控车辆，实时GPS追踪',
    warehouseRentalRequirement: '暂不涉及',
    customizedServiceRequirement: '运输',
    customizedRequirementDescription: '需要恒温恒湿运输车辆，配备防震装置',
    approvalStatus: '审批中',
    currentNode: '职能审批',
    currentApprover: '朱弢',
    createdAt: '2026-05-10 10:30',
    updatedAt: '2026-05-10 14:20',
    createdBy: '张洁',
    updatedBy: '张洁',
  },
  {
    id: '5',
    companyName: '飞雅贸易(上海)有限公司',
    englishName: 'Fiya Trading (Shanghai) Co., Ltd.',
    riskControlPurpose: '仅增加境外收发货人',
    relationshipWithHMG: '供应商',
    businessCustomerName: '飞雅贸易(上海)有限公司',
    businessCustomerCountry: '外企',
    industryChainType: '商贸服务',
    supplyChainRole: '中间商',
    crossBorderMode: '口岸',
    customerChannel: '代理',
    unifiedSocialCreditCode: '91310115MA1K4L2X8P',
    suggestedSystemCode: 'FYMY',
    opportunityName: '飞雅贸易电子产品进出口服务',
    opportunityTitle: '电子产品进出口服务',
    invoiceTitle: '飞雅贸易(上海)有限公司',
    taxId: '91310115MA1K4L2X8P',
    settlementPeriod: '30天',
    contactName: '王经理',
    contactPhone: '+86-13912345678',
    isKeyDecisionMaker: false,
    contactDepartment: '业务部',
    contactPosition: '经理',
    involvesTradeAgent: false,
    serviceProduct: '进出口',
    businessType: '免税',
    goodsType: '电子元器件',
    monthlyBusinessVolume: '500以上',
    monthlyInvoiceAmount: '2000000',
    customsKpiRequirement: '24小时内完成报关',
    transportKpiRequirement: '每周2次固定班次',
    warehouseRentalRequirement: '需要100平米恒温仓',
    customizedServiceRequirement: '信息系统',
    customizedRequirementDescription: '需要对接客户ERP系统，实现订单自动同步',
    approvalStatus: '已驳回',
    approvalResult: '已驳回',
    currentNode: '结束',
    createdAt: '2026-05-08 09:15',
    updatedAt: '2026-05-09 16:30',
    createdBy: '夏赟帆',
    updatedBy: '陆静娥',
  },
  {
    id: '6',
    companyName: '中芯国际集成电路制造有限公司',
    involvesTradeAgent: false,
    serviceProduct: '一体化供应链',
    businessType: '保税',
    goodsType: '晶圆/芯片',
    monthlyBusinessVolume: '101-500',
    monthlyInvoiceAmount: '5000000',
    customsKpiRequirement: '48小时内完成报关，需AEO高级认证',
    transportKpiRequirement: '每日一班固定班次，需全程RFID追踪',
    warehouseRentalRequirement: '需要洁净仓库5000平米，含自动化分拣系统',
    customizedServiceRequirement: '信息系统',
    customizedRequirementDescription: '需对接SAP系统，实现WMS/TMS全链路数据同步，支持VMI库存管理',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerName: '中芯国际',
    businessCustomerCountry: '中国',
    industryChainType: '半导体/集成电路',
    supplyChainRole: '芯片制造',
    crossBorderMode: '保税区域',
    customerChannel: '直客',
    unifiedSocialCreditCode: '91310000MA1FL5N06M',
    suggestedSystemCode: 'SMIC-2026-001',
    opportunityName: '中芯国际-一体化供应链',
    opportunityTitle: '中芯国际-保税区一体化供应链服务',
    invoiceTitle: '中芯国际集成电路制造有限公司',
    taxId: '91310000MA1FL5N06M',
    settlementPeriod: '月结30天',
    contactName: '王总监',
    isKeyDecisionMaker: true,
    contactDepartment: '供应链部',
    contactPosition: '总监',
    approvalStatus: '草稿',
    currentNode: '发起人',
    createdAt: '2026-05-28 14:30',
    updatedAt: '2026-05-28 14:30',
    createdBy: '张明',
    updatedBy: '张明',
  },
  {
    id: '7',
    companyName: '长江存储科技有限责任公司',
    involvesTradeAgent: true,
    serviceProduct: '仓库',
    businessType: '保税',
    goodsType: '存储芯片/模组',
    monthlyBusinessVolume: '51-100',
    monthlyInvoiceAmount: '3000000',
    customsKpiRequirement: '24小时内完成报关',
    transportKpiRequirement: '每周3班固定班次，需恒温运输',
    warehouseRentalRequirement: '需要恒温恒湿仓库2000平米',
    customizedServiceRequirement: '仓储',
    customizedRequirementDescription: '需要专业半导体材料存储，温湿度实时监控',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerName: '长江存储',
    businessCustomerCountry: '中国',
    industryChainType: '半导体/存储',
    supplyChainRole: '存储芯片制造',
    crossBorderMode: '保税仓库',
    customerChannel: '直客',
    unifiedSocialCreditCode: '91420100MA4KN4K47W',
    suggestedSystemCode: 'YMTC-2026-001',
    opportunityName: '长江存储-仓储服务',
    opportunityTitle: '长江存储-保税仓储及物流服务',
    invoiceTitle: '长江存储科技有限责任公司',
    taxId: '91420100MA4KN4K47W',
    settlementPeriod: '月结45天',
    contactName: '陈经理',
    isKeyDecisionMaker: false,
    contactDepartment: '采购部',
    contactPosition: '高级经理',
    approvalStatus: '草稿',
    currentNode: '发起人',
    createdAt: '2026-05-29 09:20',
    updatedAt: '2026-05-29 09:20',
    createdBy: '李华',
    updatedBy: '李华',
  },
];

// 图标组件
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function ApprovalsPage() {
  const { currentUser } = useApp();

  // ====== 分组功能 ======
  const groupFilter = useGroupFilter<RiskControl>({
    moduleKey: 'approvals',
    currentUserId: currentUser.id,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceProductFilter, setServiceProductFilter] = useState('all');
  const [tradeAgentFilter, setTradeAgentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // 筛选和搜索
  const filteredRiskControls = useMemo(() => {
    // 第一步：应用分组筛选
    let data = groupFilter.applyFilter(mockRiskControls);
    return data.filter(rc => {
      const matchesSearch = !searchQuery || 
        rc.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rc.businessCustomerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rc.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rc.serviceProduct.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || rc.approvalStatus === statusFilter;
      const matchesServiceProduct = serviceProductFilter === 'all' || rc.serviceProduct.includes(serviceProductFilter);
      const matchesTradeAgent = tradeAgentFilter === 'all' || 
        (tradeAgentFilter === 'yes' && rc.involvesTradeAgent) || 
        (tradeAgentFilter === 'no' && !rc.involvesTradeAgent);
      
      return matchesSearch && matchesStatus && matchesServiceProduct && matchesTradeAgent;
    });
  }, [groupFilter, searchQuery, statusFilter, serviceProductFilter, tradeAgentFilter]);

  // 获取审批状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '审批中': return 'bg-[#2D3BFF]/10 text-[#2D3BFF]';
      case '审批完成': return 'bg-[#0D8A5E]/10 text-[#0D8A5E]';
      case '已驳回': return 'bg-[#E8850C]/10 text-[#E8850C]';
      case '草稿': return 'bg-[#999999]/10 text-[#999999]';
      default: return 'bg-[#999999]/10 text-[#999999]';
    }
  };

  // 获取服务产品颜色
  const getServiceProductColor = (sp: string) => {
    const colors: Record<string, string> = {
      '货代': 'bg-[#E8F4FF] text-[#2D3BFF]',
      '关务': 'bg-[#E6FFFA] text-[#0D9488]',
      '仓库': 'bg-[#FFF7ED] text-[#EA580C]',
      '运输': 'bg-[#FEFCE8] text-[#CA8A04]',
      '进出口': 'bg-[#F0FDF4] text-[#16A34A]',
      '维修': 'bg-[#FEF2F2] text-[#DC2626]',
      '合同物流': 'bg-[#F5F3FF] text-[#7C3AED]',
      '一体化供应链': 'bg-[#FFF7ED] text-[#EA580C]',
      '其他': 'bg-[#F5F5F5] text-[#5A5A5A]',
    };
    return colors[sp] || 'bg-[#F5F5F5] text-[#5A5A5A]';
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题和操作区 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#999999] mb-2">
              <span>首页</span>
              <span>/</span>
              <span className="text-[#0A0A0A]">风控审批</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">风控审批</h1>
            <p className="text-[#5A5A5A] mt-1">管理所有风险控制审批流程，包括风险评估、贸易代理选择和审批流转</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 视图切换 */}
            <div className="flex items-center gap-1 bg-[#F5F5F5] rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'card' 
                    ? 'bg-white text-[#2D3BFF] shadow-sm' 
                    : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
                }`}
              >
                <GridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-[#2D3BFF] shadow-sm' 
                    : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
                }`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
            <Link href="/approvals/new">
              <button className="px-4 py-2.5 bg-[#2D3BFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all flex items-center gap-2 active:scale-[0.98]">
                <PlusIcon className="w-5 h-5" />
                新建风控审批
              </button>
            </Link>
          </div>
        </div>

        {/* 分组标签栏 */}
        <GroupTabs
          groups={groupFilter.groups}
          activeGroupId={groupFilter.activeGroupId}
          onSelect={groupFilter.setActiveGroupId}
          onManage={groupFilter.openCreateDialog}
        />

        {/* 搜索和筛选区 */}
        <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
              <input
                type="text"
                placeholder="搜索公司全称、业务主客户、联系人、服务产品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5 text-[#5A5A5A]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
              >
                <option value="all">审批状态</option>
                <option value="审批中">审批中</option>
                <option value="审批完成">审批完成</option>
                <option value="已驳回">已驳回</option>
                <option value="草稿">草稿</option>
              </select>
              <select
                value={serviceProductFilter}
                onChange={(e) => setServiceProductFilter(e.target.value)}
                className="px-4 py-3 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
              >
                <option value="all">服务产品</option>
                <option value="货代">货代</option>
                <option value="关务">关务</option>
                <option value="仓储">仓储</option>
                <option value="运输">运输</option>
                <option value="进出口">进出口</option>
                <option value="维修">维修</option>
                <option value="合同物流">合同物流</option>
              </select>
              <select
                value={tradeAgentFilter}
                onChange={(e) => setTradeAgentFilter(e.target.value)}
                className="px-4 py-3 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
              >
                <option value="all">贸易代理</option>
                <option value="yes">涉及贸易代理</option>
                <option value="no">不涉及贸易代理</option>
              </select>
            </div>
          </div>
        </div>

        {/* 卡片视图 */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRiskControls.map((rc) => (
              <Link key={rc.id} href={`/approvals/${rc.id}`}>
                <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#2D3BFF]/30 transition-all p-5 cursor-pointer group h-full flex flex-col">
                  {/* 卡片头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0A0A0A] text-base truncate group-hover:text-[#2D3BFF] transition-colors" title={rc.companyName}>
                        {rc.companyName}
                      </h3>
                      <p className="text-[#5A5A5A] text-sm mt-1 truncate">
                        {rc.riskControlPurpose}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${getStatusColor(rc.approvalStatus)}`}>
                      {rc.approvalStatus}
                    </span>
                  </div>

                  {/* 卡片内容 */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#999999] text-sm flex-shrink-0 w-20">服务产品:</span>
                      <span className={`px-2.5 py-1 rounded text-sm font-medium ${getServiceProductColor(rc.serviceProduct)}`}>
                        {rc.serviceProduct}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#999999] text-sm flex-shrink-0 w-20">贸易代理:</span>
                      <span className={`text-sm ${rc.involvesTradeAgent ? 'text-[#E8850C] font-medium' : 'text-[#0A0A0A]'}`}>
                        {rc.involvesTradeAgent ? '是' : '否'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#999999] text-sm flex-shrink-0 w-20">业务类型:</span>
                      <span className="text-[#0A0A0A] text-sm">{rc.businessType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#999999] text-sm flex-shrink-0 w-20">联系人:</span>
                      <span className="text-[#0A0A0A] text-sm">{rc.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#999999] text-sm flex-shrink-0 w-20">当前审核:</span>
                        <span className="text-[#2D3BFF] text-sm font-medium">{rc.currentApprover || '-'}</span>
                      </div>
                  </div>

                  {/* 卡片底部 */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F5F5F5]">
                    <span className="text-[#999999] text-sm">{rc.createdAt}</span>
                    <div className="flex items-center gap-1 text-[#999999] text-sm group-hover:text-[#2D3BFF] transition-colors">
                      <span>查看详情</span>
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-[#EBEBEB]">
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">公司全称</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">服务产品</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">业务类型</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">贸易代理</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">风控目的</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">联系人</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">当前审核人</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">审批状态</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">创建时间</th>
                    <th className="text-center px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRiskControls.map((rc) => (
                    <tr key={rc.id} className="border-b border-[#F5F5F5] hover:bg-[#F8F9FB] transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/approvals/${rc.id}`} className="text-[#2D3BFF] hover:underline font-medium text-sm">
                          {rc.companyName}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded text-sm font-medium ${getServiceProductColor(rc.serviceProduct)}`}>
                          {rc.serviceProduct}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#0A0A0A]">{rc.businessType}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm ${rc.involvesTradeAgent ? 'text-[#E8850C] font-medium' : 'text-[#0A0A0A]'}`}>
                          {rc.involvesTradeAgent ? '是' : '否'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#5A5A5A]">{rc.riskControlPurpose}</td>
                      <td className="px-5 py-4 text-sm text-[#0A0A0A]">{rc.contactName}</td>
                      <td className="px-5 py-4 text-sm text-[#2D3BFF] font-medium">{rc.currentApprover || '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rc.approvalStatus)}`}>
                          {rc.approvalStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#999999]">{rc.createdAt}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/approvals/${rc.id}`}>
                            <button className="px-3 py-1.5 text-sm text-[#2D3BFF] hover:bg-[#2D3BFF]/5 rounded-lg transition-all font-medium">
                              查看
                            </button>
                          </Link>
                          <Link href={`/approvals/${rc.id}/edit`}>
                            <button className="px-3 py-1.5 text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] rounded-lg transition-all font-medium">
                              编辑
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {filteredRiskControls.length === 0 && (
          <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-10 h-10 text-[#999999]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">暂无数据</h3>
            <p className="text-[#5A5A5A]">请尝试调整搜索条件或筛选条件</p>
          </div>
        )}

        {/* 分组管理弹窗 */}
        <GroupManageDialog
          open={groupFilter.dialogOpen}
          onClose={groupFilter.closeDialog}
          groups={groupFilter.groups}
          editingGroup={groupFilter.editingGroup}
          fieldMeta={FIELD_META_MAP.approvals}
          onSave={groupFilter.createGroup}
          onUpdate={groupFilter.updateGroup}
          onDelete={groupFilter.deleteGroup}
        />
      </div>
  );
}
