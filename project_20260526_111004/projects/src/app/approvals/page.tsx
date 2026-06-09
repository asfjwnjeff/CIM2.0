'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { useGroupFilter, GroupTabs, GroupManageDialog } from '@/components/groups';
import { FIELD_META_MAP } from '@/lib/group-utils';
import { SearchableSelect } from '@/components/ui/searchable-select';

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
  const router = useRouter();
  const { currentUser, riskApprovals, deleteRiskApproval, updateRiskApproval, customers } = useApp();

  // 从 Store 读取风控审批数据，映射为列表显示格式
  const mockRiskControls = useMemo(() => riskApprovals.map((ra: any) => ({
    id: ra.id,
    companyName: ra.companyName || '',
    businessCustomerName: ra.companyName || '',
    businessCustomerCountry: '',
    riskControlPurpose: ra.riskControlPurpose || '',
    relationshipWithHMG: ra.relationshipWithHMG || '',
    involvesTradeAgent: ra.isTradeAgent === '是',
    serviceProduct: ra.serviceProduct || '',
    businessType: ra.businessType || '',
    goodsType: ra.goodsType || '',
    contactName: ra.contactName || '',
    approvalStatus: ra.approvalStatus || '草稿',
    currentApprover: (ra.approvalSteps || []).find((s: any) => s.status === 'current')?.approver || '',
    currentNode: '',
    createdAt: ra.createdAt || '',
  })) as RiskControl[], [riskApprovals]);

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
  const [customerFilter, setCustomerFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

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
      
      const matchesCustomer = !customerFilter || rc.companyName === customerFilter;

      return matchesSearch && matchesStatus && matchesServiceProduct && matchesTradeAgent && matchesCustomer;
    });
  }, [groupFilter, searchQuery, statusFilter, serviceProductFilter, tradeAgentFilter, customerFilter]);

  // 分页
  const paginatedApprovals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRiskControls.slice(start, start + pageSize);
  }, [filteredRiskControls, currentPage]);

  const totalPages = Math.ceil(filteredRiskControls.length / pageSize);

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

  // 撤回审批
  const handleWithdraw = (id: string) => {
    const approval = riskApprovals.find((a: any) => a.id === id);
    if (!approval || approval.approvalStatus !== '审批中') return;
    updateRiskApproval(id, {
      approvalStatus: '草稿',
      status: 'draft',
      history: [
        ...(approval.history || []),
        {
          id: `h-${Date.now()}`,
          approvalId: id,
          action: 'withdrawn' as const,
          operator: currentUser?.id || 'unknown',
          operatorName: currentUser?.name || '未知用户',
          timestamp: new Date().toISOString(),
        },
      ],
      approvalSteps: (approval.approvalSteps || []).map((step: any) => ({
        ...step,
        status: 'pending',
        completed: false,
        current: false,
      })),
    });
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

        {/* 高级筛选栏 */}
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <SearchableSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: '全部状态' },
              { value: '草稿', label: '草稿' },
              { value: '审批中', label: '审批中' },
              { value: '审批完成', label: '审批完成' },
              { value: '已驳回', label: '已驳回' },
            ]}
            placeholder="审批状态"
            className="w-40"
          />
          <SearchableSelect
            value={serviceProductFilter}
            onChange={setServiceProductFilter}
            options={[
              { value: 'all', label: '全部产品' },
              { value: '货代', label: '货代' },
              { value: '关务', label: '关务' },
              { value: '仓库', label: '仓库' },
              { value: '运输', label: '运输' },
              { value: '进出口', label: '进出口' },
              { value: '维修', label: '维修' },
              { value: '合同物流', label: '合同物流' },
              { value: '一体化供应链', label: '一体化供应链' },
              { value: '其他', label: '其他' },
            ]}
            placeholder="服务产品"
            className="w-40"
          />
          <SearchableSelect
            value={customerFilter}
            onChange={setCustomerFilter}
            options={[
              { value: '', label: '全部客户' },
              ...customers.map(c => ({ value: c.name, label: c.name })),
            ]}
            placeholder="客户名称"
            className="w-48"
          />
        </div>

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
              <div>
                <label className="block text-xs font-medium text-[#5A5A5A] mb-1">审批状态</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部</option>
                  <option value="审批中">审批中</option>
                  <option value="审批完成">审批完成</option>
                  <option value="已驳回">已驳回</option>
                  <option value="草稿">草稿</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5A5A5A] mb-1">服务产品</label>
                <select
                  value={serviceProductFilter}
                  onChange={(e) => setServiceProductFilter(e.target.value)}
                  className="px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部</option>
                  <option value="货代">货代</option>
                  <option value="关务">关务</option>
                  <option value="仓库">仓库</option>
                  <option value="运输">运输</option>
                  <option value="进出口">进出口</option>
                  <option value="维修">维修</option>
                  <option value="合同物流">合同物流</option>
                  <option value="一体化供应链">一体化供应链</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5A5A5A] mb-1">是否贸易代理</label>
                <select
                  value={tradeAgentFilter}
                  onChange={(e) => setTradeAgentFilter(e.target.value)}
                  className="px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">不限</option>
                  <option value="yes">涉及贸易代理</option>
                  <option value="no">不涉及贸易代理</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 卡片视图 */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedApprovals.map((rc) => (
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 whitespace-nowrap ${getStatusColor(rc.approvalStatus)}`}>
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
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A] whitespace-nowrap min-w-[100px]">审批状态</th>
                    <th className="text-left px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">创建时间</th>
                    <th className="text-center px-5 py-3.5 text-sm font-semibold text-[#0A0A0A]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApprovals.map((rc) => (
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
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(rc.approvalStatus)}`}>
                          {rc.approvalStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#999999]">{rc.createdAt}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => router.push(`/approvals/${rc.id}`)} className="px-3 py-1.5 text-sm whitespace-nowrap text-[#2D3BFF] hover:bg-[#2D3BFF]/5 rounded-lg transition-all font-medium">
                            查看
                          </button>
                          {(rc.approvalStatus === '草稿' || rc.approvalStatus === '已驳回') ? (
                            <>
                              <button onClick={() => router.push(`/approvals/${rc.id}/edit`)} className="px-3 py-1.5 text-sm whitespace-nowrap text-[#5A5A5A] hover:bg-[#F5F5F5] rounded-lg transition-all font-medium">
                                编辑
                              </button>
                              <button
                                onClick={() => { if (confirm('确定要删除该审批记录吗？')) deleteRiskApproval(rc.id); }}
                                className="px-3 py-1.5 text-sm whitespace-nowrap text-[#D63031] hover:bg-[#FFEBEE] rounded-lg transition-all font-medium"
                              >
                                删除
                              </button>
                            </>
                          ) : (
                            <span className="px-3 py-1.5 text-sm whitespace-nowrap text-[#D5D5D5] cursor-not-allowed">编辑</span>
                          )}
                          {rc.approvalStatus === '审批中' && (
                            <button
                              onClick={() => { if (confirm('确定要撤回该审批吗？')) handleWithdraw(rc.id); }}
                              className="px-3 py-1.5 text-sm whitespace-nowrap text-[#E8850C] hover:bg-[#FFF7ED] rounded-lg transition-all font-medium"
                            >
                              撤回
                            </button>
                          )}
                          <button onClick={() => router.push(`/approvals/${rc.id}?tab=history`)} className="px-3 py-1.5 text-sm whitespace-nowrap text-[#5A5A5A] hover:bg-[#F5F5F5] rounded-lg transition-all font-medium">
                            历史
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-[#5A5A5A] px-3">
              第 {currentPage} / {totalPages} 页（共 {filteredRiskControls.length} 条）
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        )}

        {/* 空状态 */}
        {paginatedApprovals.length === 0 && (
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
