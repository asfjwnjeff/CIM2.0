'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import type { FollowUpRecord } from '@/lib/types';
import { useGroupFilter, GroupTabs, GroupManageDialog } from '@/components/groups';
import { FIELD_META_MAP } from '@/lib/group-utils';

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

const TableIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
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

const PhoneIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.22a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MailIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const UsersIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const MessageSquareIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const FileTextIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const CalendarIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// 示例客户数据
const mockCustomers = [
  { id: '1', name: '应用材料(中国)有限公司' },
  { id: '2', name: '飞雅贸易(上海)有限公司' },
  { id: '3', name: '荏原机械(中国)有限公司' },
  { id: '4', name: '苏斯贸易(上海)有限公司' },
  { id: '5', name: '昇先创国际贸易(上海)有限公司' },
  { id: '6', name: '上海华力微电子有限公司' },
];

// 示例联系人数据
const mockContacts = [
  { id: '1', name: '李总' },
  { id: '2', name: '王经理' },
  { id: '3', name: '张总监' },
  { id: '4', name: '陈主管' },
];

// 示例跟进数据
const mockFollowUps = [
  {
    id: '1',
    customerId: '1',
    type: 'phone',
    method: '电话',
    followUpDate: '2025-06-15',
    status: 'discussing',
    owner: '张经理',
    collaborators: '李主管',
    contactId: '1',
    content: '与李总电话沟通新项目需求，客户表示有兴趣了解我们的物流服务方案，约定下周三发送详细报价。',
    nextFollowUpDate: '2025-06-20',
    createdAt: '2025-06-15 14:30',
    attachments: []
  },
  {
    id: '2',
    customerId: '2',
    type: 'meeting',
    method: '现场',
    followUpDate: '2025-06-14',
    status: 'promoting',
    owner: '张经理',
    collaborators: '',
    contactId: '2',
    content: '现场拜访飞雅贸易，与王经理洽谈仓储需求，客户需要1000平米恒温仓库，已初步达成合作意向。',
    nextFollowUpDate: '2025-06-18',
    createdAt: '2025-06-14 10:00',
    attachments: ['报价单.pdf', '仓库平面图.png']
  },
  {
    id: '3',
    customerId: '3',
    type: 'email',
    method: '邮件',
    followUpDate: '2025-06-13',
    status: 'success',
    owner: '李主管',
    collaborators: '张经理',
    contactId: '3',
    content: '邮件确认合同细节，双方达成一致，已发送电子合同等待签署。',
    nextFollowUpDate: '',
    createdAt: '2025-06-13 16:45',
    attachments: ['合同草稿.pdf']
  },
  {
    id: '4',
    customerId: '4',
    type: 'phone',
    method: '电话',
    followUpDate: '2025-06-12',
    status: 'no_progress',
    owner: '李主管',
    collaborators: '',
    contactId: '4',
    content: '电话联系苏斯贸易陈主管，客户表示近期预算紧张，暂时不考虑新增服务。',
    nextFollowUpDate: '2025-07-01',
    createdAt: '2025-06-12 09:15',
    attachments: []
  },
  {
    id: '5',
    customerId: '5',
    type: 'meeting',
    method: '视频',
    followUpDate: '2025-06-10',
    status: 'new',
    owner: '张经理',
    collaborators: '王助理',
    contactId: '1',
    content: '视频会议初次接触昇先创，介绍我司业务范围，客户表示有货代需求，后续会发详细资料。',
    nextFollowUpDate: '2025-06-16',
    createdAt: '2025-06-10 15:00',
    attachments: ['公司介绍.pdf']
  }
];

export default function FollowUpPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  // ====== 分组功能 ======
  const groupFilter = useGroupFilter<FollowUpRecord>({
    moduleKey: 'followup',
    currentUserId: currentUser.id,
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  
  // 筛选数据
  const filteredFollowUps = useMemo(() => {
    // 第一步：应用分组筛选
    let data = groupFilter.applyFilter(mockFollowUps as FollowUpRecord[]);
    return data.filter(followUp => {
      // 关键词搜索
      const matchesKeyword = 
        !searchKeyword || 
        (followUp.content || '').includes(searchKeyword) ||
        followUp.nextFollowUpDate?.includes(searchKeyword) ||
        mockCustomers.find(c => c.id === followUp.customerId)?.name.includes(searchKeyword) ||
        mockContacts.find(ct => ct.id === followUp.contactId)?.name?.includes(searchKeyword) ||
        (followUp.owner || '').includes(searchKeyword);
      
      // 类型筛选
      const matchesType = filterType === 'all' || followUp.type === filterType;
      
      // 状态筛选
      const matchesStatus = filterStatus === 'all' || followUp.status === filterStatus;
      
      // 方式筛选
      const matchesMethod = filterMethod === 'all' || followUp.method === filterMethod;
      
      // 客户筛选
      const matchesCustomer = filterCustomer === 'all' || followUp.customerId === filterCustomer;
      
      return matchesKeyword && matchesType && matchesStatus && matchesMethod && matchesCustomer;
    }).sort((a, b) => new Date(b.followUpDate || b.createdAt).getTime() - new Date(a.followUpDate || a.createdAt).getTime());
  }, [groupFilter, searchKeyword, filterType, filterStatus, filterMethod, filterCustomer]);

  // 获取状态徽章颜色
  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'bg-[#F5F5F5] text-[#5A5A5A]';
    switch (status) {
      case 'new': return 'bg-[#D4EDDA] text-[#28A745]';
      case 'discussing': return 'bg-[#CCE5FF] text-[#2D3BFF]';
      case 'promoting': return 'bg-[#FFF3CD] text-[#FFC107]';
      case 'success': return 'bg-[#D4EDDA] text-[#28A745]';
      case 'no_progress': return 'bg-[#F8D7DA] text-[#DC3545]';
      case 'cancelled': return 'bg-[#F8D7DA] text-[#DC3545]';
      case 'terminated': return 'bg-[#F8D7DA] text-[#DC3545]';
      default: return 'bg-[#F5F5F5] text-[#5A5A5A]';
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return '-';
    switch (status) {
      case 'new': return '新需求';
      case 'discussing': return '沟通中';
      case 'promoting': return '推进中';
      case 'success': return '成功';
      case 'no_progress': return '无进展';
      case 'cancelled': return '需求取消';
      case 'terminated': return '合同终止';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'phone': return '电话沟通';
      case 'email': return '邮件';
      case 'meeting': return '会议';
      case 'other': return '其他';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return PhoneIcon;
      case 'email': return MailIcon;
      case 'meeting': return UsersIcon;
      case 'other': return MessageSquareIcon;
      default: return MessageSquareIcon;
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '-';
    return mockCustomers.find(c => c.id === customerId)?.name || '-';
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return '-';
    return mockContacts.find(ct => ct.id === contactId)?.name || '-';
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题和操作区 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">客户跟进</h1>
            <p className="text-[#5A5A5A] mt-1">管理所有客户跟进记录，包括跟进内容、录音和AI会议纪要</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/followup/new')}
              className="inline-flex items-center px-4 py-2 bg-[#2D3BFF] text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all gap-2 shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              新增跟进
            </button>
          </div>
        </div>

        {/* 分组标签栏 */}
        <GroupTabs
          groups={groupFilter.groups}
          activeGroupId={groupFilter.activeGroupId}
          onSelect={groupFilter.setActiveGroupId}
          onManage={groupFilter.openCreateDialog}
        />

        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="text"
                placeholder="搜索客户名称、联系人、跟进内容..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-white border border-[#D5D5D5] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
              />
            </div>
            {/* 筛选按钮 */}
            <button
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
            <div className="flex items-center bg-white rounded-lg p-1 border border-[#D5D5D5]">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table' ? 'bg-[#2D3BFF] text-white shadow-sm' : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
                }`}
                data-view="table"
              >
                <TableIcon className="w-4 h-4 inline mr-1.5" />
                表格
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'timeline' ? 'bg-[#2D3BFF] text-white shadow-sm' : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
                }`}
                data-view="timeline"
              >
                <ListIcon className="w-4 h-4 inline mr-1.5" />
                时间线
              </button>
            </div>
          </div>
        </div>

        {/* 筛选面板 */}
        {showFilter && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">客户</label>
                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部客户</option>
                  {mockCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进类型</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部类型</option>
                  <option value="phone">电话沟通</option>
                  <option value="email">邮件</option>
                  <option value="meeting">会议</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进方式</label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部方式</option>
                  <option value="电话">电话</option>
                  <option value="邮件">邮件</option>
                  <option value="现场">现场</option>
                  <option value="视频">视频</option>
                  <option value="会议">会议</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进状态</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-lg px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                >
                  <option value="all">全部状态</option>
                  <option value="new">新需求</option>
                  <option value="discussing">沟通中</option>
                  <option value="promoting">推进中</option>
                  <option value="success">成功</option>
                  <option value="no_progress">无进展</option>
                  <option value="cancelled">需求取消</option>
                  <option value="terminated">合同终止</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 表格视图 */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F5F5] text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">客户名称</th>
                    <th className="px-4 py-3 text-left">跟进类型</th>
                    <th className="px-4 py-3 text-left">跟进方式</th>
                    <th className="px-4 py-3 text-left">跟进时间</th>
                    <th className="px-4 py-3 text-left">跟进状态</th>
                    <th className="px-4 py-3 text-left">负责人</th>
                    <th className="px-4 py-3 text-left">协同人</th>
                    <th className="px-4 py-3 text-left">联系人</th>
                    <th className="px-4 py-3 text-left">下次跟进</th>
                    <th className="px-4 py-3 text-left">创建时间</th>
                    <th className="px-4 py-3 text-left">附件</th>
                    <th className="px-4 py-3 text-left">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {filteredFollowUps.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-[#999999]">
                        暂无跟进记录
                      </td>
                    </tr>
                  ) : (
                    filteredFollowUps.map((followUp) => {
                      const TypeIcon = getTypeIcon(followUp.type);
                      return (
                        <tr key={followUp.id} className="hover:bg-[#F5F5F5] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#0A0A0A]">
                            {getCustomerName(followUp.customerId)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {getTypeLabel(followUp.type)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {followUp.method}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {followUp.followUpDate}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(followUp.status)}`}>
                              {getStatusLabel(followUp.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {followUp.owner}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {followUp.collaborators 
                              ? followUp.collaborators 
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {getContactName(followUp.contactId)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {followUp.nextFollowUpDate || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#5A5A5A]">
                            {followUp.createdAt}
                          </td>
                          <td className="px-4 py-3">
                            {followUp.attachments && followUp.attachments.length > 0 ? (
                              <button className="text-[#2D3BFF] text-sm hover:underline">
                                {followUp.attachments.length}个
                              </button>
                            ) : (
                              <span className="text-[#999999]">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => router.push(`/followup/${followUp.id}`)}
                                className="text-[#2D3BFF] text-sm font-medium whitespace-nowrap hover:underline"
                              >
                                查看
                              </button>
                              <button
                                onClick={() => router.push(`/followup/${followUp.id}/edit`)}
                                className="text-[#2D3BFF] text-sm font-medium whitespace-nowrap hover:underline"
                              >
                                编辑
                              </button>
                              <button className="text-[#DC3545] text-sm font-medium whitespace-nowrap hover:underline">
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 时间线视图 */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {filteredFollowUps.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-8 text-center text-[#999999]">
                暂无跟进记录
              </div>
            ) : (
              filteredFollowUps.map((followUp, index) => {
                const TypeIcon = getTypeIcon(followUp.type);
                const isLast = index === filteredFollowUps.length - 1;
                return (
                  <div key={followUp.id} className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5 hover:shadow-md hover:border-[#2D3BFF]/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#CCE5FF] text-[#2D3BFF] flex items-center justify-center">
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 bg-[#EBEBEB] mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-[#0A0A0A]">
                              {getCustomerName(followUp.customerId)}
                            </h3>
                            <p className="text-sm text-[#5A5A5A] mt-1">
                              {getTypeLabel(followUp.type)} · {followUp.method || '-'} · {getContactName(followUp.contactId)} · {getStatusLabel(followUp.status)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#999999]">
                              {followUp.followUpDate}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => router.push(`/followup/${followUp.id}`)}
                                className="text-[#2D3BFF] text-sm whitespace-nowrap hover:underline"
                              >
                                查看
                              </button>
                              <span className="text-[#CCCCCC]">·</span>
                              <button
                                onClick={() => router.push(`/followup/${followUp.id}/edit`)}
                                className="text-[#2D3BFF] text-sm whitespace-nowrap hover:underline"
                              >
                                编辑
                              </button>
                              <span className="text-[#CCCCCC]">·</span>
                              <button className="text-[#DC3545] text-sm whitespace-nowrap hover:underline">
                                删除
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-[#0A0A0A]">
                          <p>{followUp.content}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-[#5A5A5A]">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="w-3.5 h-3.5" />
                            负责人：{followUp.owner}
                          </span>
                          {followUp.collaborators && (
                            <span className="flex items-center gap-1">
                              <UsersIcon className="w-3.5 h-3.5" />
                              协同人：{followUp.collaborators}
                            </span>
                          )}
                          {followUp.attachments && followUp.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileTextIcon className="w-3.5 h-3.5" />
                              附件：{followUp.attachments.length}个
                            </span>
                          )}
                          {followUp.nextFollowUpDate && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              下次跟进：{followUp.nextFollowUpDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 分组管理弹窗 */}
        <GroupManageDialog
          open={groupFilter.dialogOpen}
          onClose={groupFilter.closeDialog}
          groups={groupFilter.groups}
          editingGroup={groupFilter.editingGroup}
          fieldMeta={FIELD_META_MAP.followup}
          onSave={groupFilter.createGroup}
          onUpdate={groupFilter.updateGroup}
          onDelete={groupFilter.deleteGroup}
        />
      </div>
  );
}
