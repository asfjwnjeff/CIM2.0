'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

// 内联SVG图标
const PlusIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const ListIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const LayoutGridIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

// 商机类型定义
interface Opportunity {
  id: string;
  opportunityNumber: string;
  opportunityName: string;
  customerId: string;
  customerName: string;
  serviceProduct: string;
  estimatedMonthlyAmount: number;
  opportunityAmount: number;
  salesStage: 'demand_confirmation' | 'solution_quotation' | 'business_negotiation' | 'following' | 'won' | 'lost';
  owner: string;
  createdAt: string;
  description?: string;
}

// 示例商机数据
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    opportunityNumber: 'OPP-2026-05-0001',
    opportunityName: '半导体设备物流需求',
    customerId: '1',
    customerName: '应用材料(中国)有限公司',
    serviceProduct: '货代',
    estimatedMonthlyAmount: 200000,
    opportunityAmount: 2400000,
    salesStage: 'demand_confirmation',
    owner: '李雪',
    createdAt: '2026-05-15 09:30:00',
    description: '客户有半导体设备进口物流需求，需要评估货代服务能力',
  },
  {
    id: '2',
    opportunityNumber: 'OPP-2026-05-0002',
    opportunityName: '电子产品进口仓储',
    customerId: '2',
    customerName: '飞雅贸易(上海)有限公司',
    serviceProduct: '仓储',
    estimatedMonthlyAmount: 80000,
    opportunityAmount: 960000,
    salesStage: 'solution_quotation',
    owner: '王磊',
    createdAt: '2026-05-16 14:20:00',
    description: '客户需要上海地区的仓储服务，用于电子产品进口',
  },
  {
    id: '3',
    opportunityNumber: 'OPP-2026-05-0003',
    opportunityName: '机械制造运输项目',
    customerId: '3',
    customerName: '荏原机械(中国)有限公司',
    serviceProduct: '运输',
    estimatedMonthlyAmount: 150000,
    opportunityAmount: 1800000,
    salesStage: 'business_negotiation',
    owner: '张伟',
    createdAt: '2026-05-17 10:15:00',
    description: '机械制造企业有大型设备运输需求，正在商务谈判阶段',
  },
  {
    id: '4',
    opportunityNumber: 'OPP-2026-05-0004',
    opportunityName: '半导体进出口服务',
    customerId: '1',
    customerName: '应用材料(中国)有限公司',
    serviceProduct: '进出口',
    estimatedMonthlyAmount: 300000,
    opportunityAmount: 3600000,
    salesStage: 'following',
    owner: '李雪',
    createdAt: '2026-05-18 11:00:00',
    description: '半导体产品进出口服务需求，正在跟进中',
  },
  {
    id: '5',
    opportunityNumber: 'OPP-2026-05-0005',
    opportunityName: '一体化供应链方案',
    customerId: '4',
    customerName: '昇先创(上海)贸易有限公司',
    serviceProduct: '一体化供应链',
    estimatedMonthlyAmount: 500000,
    opportunityAmount: 6000000,
    salesStage: 'solution_quotation',
    owner: '陈静',
    createdAt: '2026-05-19 15:30:00',
    description: '客户需要一体化供应链解决方案，正在制定方案报价',
  },
];

// 服务产品列表
const serviceProducts = [
  '货代',
  '关务',
  '仓储',
  '运输',
  '进出口',
  '维修',
  '合同物流',
  '一体化供应链',
  '其他',
];

// 客户列表
const customers = [
  { id: '1', name: '应用材料(中国)有限公司' },
  { id: '2', name: '飞雅贸易(上海)有限公司' },
  { id: '3', name: '荏原机械(中国)有限公司' },
  { id: '4', name: '昇先创(上海)贸易有限公司' },
];

export default function OpportunitiesPage() {
  const router = useRouter();
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showFilter, setShowFilter] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterServiceProduct, setFilterServiceProduct] = useState<string>('all');
  const [filterSalesStage, setFilterSalesStage] = useState<string>('all');
  
  // 筛选数据
  const filteredOpportunities = useMemo(() => {
    return mockOpportunities.filter(opportunity => {
      // 关键词搜索
      const matchesKeyword = 
        !searchKeyword || 
        opportunity.opportunityName?.includes(searchKeyword) ||
        opportunity.opportunityNumber?.includes(searchKeyword) ||
        opportunity.customerName.includes(searchKeyword);
      
      // 客户筛选
      const matchesCustomer = filterCustomer === 'all' || opportunity.customerId === filterCustomer;
      
      // 服务产品筛选
      const matchesServiceProduct = filterServiceProduct === 'all' || opportunity.serviceProduct === filterServiceProduct;
      
      // 销售阶段筛选
      const matchesSalesStage = filterSalesStage === 'all' || opportunity.salesStage === filterSalesStage;
      
      return matchesKeyword && matchesCustomer && matchesServiceProduct && matchesSalesStage;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchKeyword, filterCustomer, filterServiceProduct, filterSalesStage]);

  // 获取状态徽章颜色（与看板视图颜色一致）
  const getStatusBadgeClass = (stage: string) => {
    switch (stage) {
      case 'demand_confirmation': return 'bg-[#E8F4FF] text-[#2D3BFF]';
      case 'solution_quotation': return 'bg-[#E6FFFA] text-[#0D9488]';
      case 'business_negotiation': return 'bg-[#FFF7ED] text-[#EA580C]';
      case 'following': return 'bg-[#FEFCE8] text-[#CA8A04]';
      case 'won': return 'bg-[#F0FDF4] text-[#16A34A]';
      case 'lost': return 'bg-[#FEF2F2] text-[#DC2626]';
      default: return 'bg-[#F5F5F5] text-[#5A5A5A]';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'demand_confirmation': return '需求确认';
      case 'solution_quotation': return '方案报价';
      case 'business_negotiation': return '商务谈判';
      case 'following': return '跟进中';
      case 'won': return '赢单';
      case 'lost': return '输单';
      default: return stage;
    }
  };

  // 看板视图的列分组
  const kanbanColumns = [
    { key: 'demand_confirmation', label: '需求确认', color: 'blue' },
    { key: 'solution_quotation', label: '方案报价', color: 'cyan' },
    { key: 'business_negotiation', label: '商务谈判', color: 'orange' },
    { key: 'following', label: '跟进中', color: 'yellow' },
    { key: 'won', label: '赢单', color: 'green' },
    { key: 'lost', label: '输单', color: 'red' },
  ];

  // 获取看板列的颜色样式
  const getKanbanColumnColor = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          header: 'bg-[#E8F4FF] border-l-4 border-[#2D3BFF]',
          label: 'text-[#2D3BFF]'
        };
      case 'cyan':
        return {
          header: 'bg-[#E6FFFA] border-l-4 border-[#0D9488]',
          label: 'text-[#0D9488]'
        };
      case 'orange':
        return {
          header: 'bg-[#FFF7ED] border-l-4 border-[#EA580C]',
          label: 'text-[#EA580C]'
        };
      case 'yellow':
        return {
          header: 'bg-[#FEFCE8] border-l-4 border-[#CA8A04]',
          label: 'text-[#CA8A04]'
        };
      case 'green':
        return {
          header: 'bg-[#F0FDF4] border-l-4 border-[#16A34A]',
          label: 'text-[#16A34A]'
        };
      case 'red':
        return {
          header: 'bg-[#FEF2F2] border-l-4 border-[#DC2626]',
          label: 'text-[#DC2626]'
        };
      default:
        return {
          header: 'bg-[#F5F5F5]',
          label: 'text-[#0A0A0A]'
        };
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题和操作区 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">商机管理</h1>
            <p className="text-[#5A5A5A] mt-1">管理所有销售商机，包括商机信息、销售阶段、跟进记录和成交情况</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/opportunities/new')}
              className="inline-flex items-center px-4 py-2 bg-[#2D3BFF] text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all gap-2 shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              新增商机
            </button>
          </div>
        </div>

        {/* 顶部操作区 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* 搜索框 */}
              <div className="relative">
                <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="搜索商机名称、编号、客户..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-white border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all w-64"
                />
              </div>
              {/* 筛选按钮 */}
              <button
                id="btn-filter"
                onClick={() => setShowFilter(!showFilter)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all ${
                  showFilter 
                    ? 'bg-[#2D3BFF] text-white' 
                    : 'bg-white text-[#0A0A0A] border border-[#D5D5D5] hover:border-[#2D3BFF]/30'
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                筛选
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* 视图切换 */}
              <div className="flex bg-white rounded-lg p-1 border border-[#D5D5D5]">
                <button
                  id="btn-list-view"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list' ? 'bg-[#2D3BFF] text-white shadow-sm' : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
                  }`}
                >
                  <ListIcon className="w-4 h-4 inline mr-1.5" />
                  列表
                </button>
                <button
                  id="btn-kanban-view"
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'kanban' ? 'bg-[#2D3BFF] text-white shadow-sm' : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
                  }`}
                >
                  <LayoutGridIcon className="w-4 h-4 inline mr-1.5" />
                  看板
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选面板 */}
        {showFilter && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">客户</label>
                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部客户</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">服务产品</label>
                <select
                  value={filterServiceProduct}
                  onChange={(e) => setFilterServiceProduct(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部产品</option>
                  {serviceProducts.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">销售阶段</label>
                <select
                  value={filterSalesStage}
                  onChange={(e) => setFilterSalesStage(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部阶段</option>
                  <option value="demand_confirmation">需求确认</option>
                  <option value="solution_quotation">方案报价</option>
                  <option value="business_negotiation">商务谈判</option>
                  <option value="following">跟进中</option>
                  <option value="won">赢单</option>
                  <option value="lost">输单</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div id="list-view" className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
            <div className="grid grid-cols-10 px-4 py-3 bg-[#F5F5F5] text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide">
              <span>商机编号</span>
              <span>商机名称</span>
              <span>关联客户</span>
              <span>服务产品</span>
              <span>预估月度金额</span>
              <span>商机金额</span>
              <span>销售阶段</span>
              <span>创建人</span>
              <span>创建时间</span>
              <span>操作</span>
            </div>
            <div className="divide-y divide-[#EBEBEB]">
              {filteredOpportunities.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#999999]">
                  暂无商机
                </div>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="grid grid-cols-10 px-4 py-3 hover:bg-[#F5F5F5] transition-colors items-center"
                  >
                    <span className="text-sm font-medium text-[#2D3BFF]">{opportunity.opportunityNumber || '-'}</span>
                    <span className="text-sm font-medium text-[#0A0A0A]">{opportunity.opportunityName || '-'}</span>
                    <span className="text-sm text-[#5A5A5A]">{opportunity.customerName}</span>
                    <span className="text-sm text-[#5A5A5A]">{opportunity.serviceProduct}</span>
                    <span className="text-sm font-semibold text-[#2D3BFF]">
                      {opportunity.estimatedMonthlyAmount ? `¥${opportunity.estimatedMonthlyAmount.toLocaleString()}` : '-'}
                    </span>
                    <span className="text-sm font-semibold text-[#2D3BFF]">
                      {opportunity.opportunityAmount ? `¥${opportunity.opportunityAmount.toLocaleString()}` : '-'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs w-fit ${getStatusBadgeClass(opportunity.salesStage)}`}>
                      {getStageLabel(opportunity.salesStage)}
                    </span>
                    <span className="text-sm text-[#5A5A5A]">{opportunity.owner}</span>
                    <span className="text-sm text-[#5A5A5A]">{opportunity.createdAt.split(' ')[0]}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/opportunities/${opportunity.id}`)}
                        className="text-[#2D3BFF] text-sm font-medium hover:underline w-fit"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => router.push(`/opportunities/${opportunity.id}/edit`)}
                        className="text-[#2D3BFF] text-sm font-medium hover:underline w-fit"
                      >
                        编辑
                      </button>
                      <button className="text-[#DC3545] text-sm font-medium hover:underline w-fit">
                        删除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 看板视图 */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((column) => {
              const columnOpportunities = filteredOpportunities.filter(opp => opp.salesStage === column.key);
              const columnColors = getKanbanColumnColor(column.color);
              return (
                <div key={column.key} className="flex-1 min-w-[280px] max-w-[350px]">
                  <div className={`rounded-lg p-3 mb-3 ${columnColors.header}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${columnColors.label}`}>{column.label}</h3>
                      <span className="text-sm text-[#5A5A5A] bg-white rounded-full px-2 py-0.5">
                        {columnOpportunities.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {columnOpportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4 hover:shadow-md hover:border-[#2D3BFF]/30 transition-all cursor-pointer"
                        onClick={() => router.push(`/opportunities/${opportunity.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-[#2D3BFF]">{opportunity.opportunityNumber || '-'}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${getStatusBadgeClass(opportunity.salesStage)}`}>
                            {getStageLabel(opportunity.salesStage)}
                          </span>
                        </div>
                        <h4 className="font-medium text-[#0A0A0A] mb-2">{opportunity.opportunityName}</h4>
                        <div className="text-sm text-[#5A5A5A] mb-2">
                          {opportunity.customerName}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#5A5A5A]">{opportunity.serviceProduct}</span>
                          {opportunity.opportunityAmount && (
                            <span className="font-medium text-[#2D3BFF]">¥{opportunity.opportunityAmount.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#EBEBEB] flex items-center justify-between text-xs text-[#5A5A5A]">
                          <span>{opportunity.owner}</span>
                          <span>{opportunity.createdAt.split(' ')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}