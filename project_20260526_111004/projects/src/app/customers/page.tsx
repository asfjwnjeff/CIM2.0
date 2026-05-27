'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';
import type { Customer, ProgressStatus, IndustryChainLevel } from '@/lib/types';
import {
  INDUSTRY_CHAIN_LEVEL_LABELS,
  INDUSTRY_CHAIN_LEVEL_COLORS,
  PROGRESS_STATUS_LABELS,
  PROGRESS_STATUS_COLORS,
  MOCK_USERS,
} from '@/lib/sample-data';
import { CollaborationDialogs, type CollaborationResult, type CollaborationDialogType } from '@/components/CollaborationDialogs';
import { EmptyState, SearchEmptyState } from '@/components/ui/empty-state';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  MoreHorizontal,
  User,
  Phone,
  ChevronDown,
  Check,
} from 'lucide-react';

type ViewMode = 'card' | 'table';

const VIEW_STORAGE_KEY = 'cim-customers-view-mode';

function getStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'card';
  return (localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode) || 'card';
}

function setStoredViewMode(mode: ViewMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VIEW_STORAGE_KEY, mode);
}

function getUserById(id: string) {
  return MOCK_USERS.find((u) => u.id === id);
}

function UserAvatar({ userId, size }: { userId: string; size?: 'sm' | 'md' }) {
  const user = getUserById(userId);
  const initial = user ? user.name.charAt(0) : '?';
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-[#2D3BFF] text-white flex items-center justify-center font-medium shrink-0`}>
      {initial}
    </div>
  );
}

function ProgressBadge({ status }: { status: ProgressStatus }) {
  const colors = PROGRESS_STATUS_COLORS[status];
  const label = PROGRESS_STATUS_LABELS[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-[#E6F7F0] text-[#0D8A5E]',
    inactive: 'bg-[#EBEBEB] text-[#5A5A5A]',
    potential: 'bg-[#FFF4E8] text-[#E8850C]',
    frozen: 'bg-[#FFEBEE] text-[#D63031]',
  };
  const labelMap: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    potential: '潜在',
    frozen: '冻结',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-600'}`}>
      {labelMap[status] || status}
    </span>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const {
    customers,
    addLog,
    collaborateCustomer,
    assignCustomer,
    transferCustomer,
    batchCollaborate,
    batchAssign,
    batchTransfer,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<IndustryChainLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProgress, setFilterProgress] = useState<ProgressStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(getStoredViewMode);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Collaboration dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<CollaborationDialogType>('collaborate');
  const [dialogCustomerName, setDialogCustomerName] = useState('');
  const [dialogCustomerId, setDialogCustomerId] = useState<string | null>(null);
  const [dialogOwnerIds, setDialogOwnerIds] = useState<string[]>([]);
  const [dialogCollaboratorIds, setDialogCollaboratorIds] = useState<string[]>([]);

  // Dropdown open state for each row
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setStoredViewMode(mode);
  }, []);

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(s) ||
        (c.customerCode && c.customerCode.toLowerCase().includes(s)) ||
        c.basicInfo?.unifiedSocialCreditCode?.toLowerCase().includes(s) ||
        (c.basicInfo?.phone && c.basicInfo.phone.includes(s)) ||
        (c.basicInfo?.legalRepresentative && c.basicInfo.legalRepresentative.toLowerCase().includes(s))
      );
    }

    if (filterLevel !== 'all') {
      result = result.filter((c) => c.semiconductorInfo?.industryChainLevel === filterLevel);
    }

    if (filterStatus !== 'all') {
      result = result.filter((c) => c.status === filterStatus);
    }

    if (filterProgress !== 'all') {
      result = result.filter((c) => c.progressStatus === filterProgress);
    }

    return result;
  }, [customers, search, filterLevel, filterStatus, filterProgress]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map((c) => c.id)));
    }
  }, [selectedIds.size, filteredCustomers]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Single customer collaboration actions
  const openDialog = useCallback((
    type: CollaborationDialogType,
    customerId: string,
    customerName: string,
    ownerIds?: string[],
    collaboratorIds?: string[],
  ) => {
    setDialogType(type);
    setDialogCustomerId(customerId);
    setDialogCustomerName(customerName);
    setDialogOwnerIds(ownerIds || []);
    setDialogCollaboratorIds(collaboratorIds || []);
    setDialogOpen(true);
  }, []);

  const handleDialogConfirm = useCallback((result: CollaborationResult) => {
    if (result.type === 'collaborate') {
      if (dialogCustomerId) {
        collaborateCustomer(dialogCustomerId, result.collaboratorIds || []);
        addLog({
          action: 'collaborate',
          operator: '系统管理员',
          targetType: 'customer',
          targetId: dialogCustomerId,
          targetName: dialogCustomerName,
          details: `更新了协同人`,
        });
      }
    } else if (result.type === 'assign') {
      if (dialogCustomerId && result.responsiblePersonIds?.length) {
        assignCustomer(dialogCustomerId, result.responsiblePersonIds);
        const users = result.responsiblePersonIds.map(getUserById).filter(Boolean);
        const userNames = users.map((u) => u!.name).join('、');
        addLog({
          action: 'assign',
          operator: '系统管理员',
          targetType: 'customer',
          targetId: dialogCustomerId,
          targetName: dialogCustomerName,
          details: `分配负责人为 ${userNames || result.responsiblePersonIds.join('、')}`,
        });
      }
    } else if (result.type === 'transfer') {
      if (dialogCustomerId && result.newResponsiblePersonId) {
        transferCustomer(dialogCustomerId, result.newResponsiblePersonId, result.reason);
        const user = getUserById(result.newResponsiblePersonId);
        addLog({
          action: 'transfer',
          operator: '系统管理员',
          targetType: 'customer',
          targetId: dialogCustomerId,
          targetName: dialogCustomerName,
          details: `移交负责人为 ${user?.name || result.newResponsiblePersonId}${result.reason ? `，原因: ${result.reason}` : ''}`,
        });
      }
    }
    setDialogOpen(false);
    setDialogCustomerId(null);
    setOpenMenuId(null);
  }, [dialogCustomerId, dialogCustomerName, collaborateCustomer, assignCustomer, transferCustomer, addLog]);

  // Batch operations
  const handleBatchAction = useCallback((type: CollaborationDialogType) => {
    if (selectedIds.size === 0) return;
    const first = customers.find((c) => c.id === Array.from(selectedIds)[0]);
    setDialogType(type);
    setDialogCustomerId(null); // null means batch mode
    setDialogCustomerName(`已选 ${selectedIds.size} 个客户`);
    setDialogOwnerIds(first?.responsiblePersons || []);
    setDialogCollaboratorIds([]);
    setDialogOpen(true);
  }, [selectedIds, customers]);

  const handleBatchDialogConfirm = useCallback((result: CollaborationResult) => {
    const ids = Array.from(selectedIds);
    const names = customers.filter((c) => ids.includes(c.id)).map((c) => c.name).join('、');

    if (result.type === 'collaborate') {
      batchCollaborate(ids, result.collaboratorIds || []);
      addLog({
        action: 'collaborate',
        operator: '系统管理员',
        targetType: 'customer',
        details: `批量更新 ${ids.length} 个客户的协同人: ${names}`,
      });
    } else if (result.type === 'assign' && result.responsiblePersonIds?.length) {
      batchAssign(ids, result.responsiblePersonIds);
      const users = result.responsiblePersonIds.map(getUserById).filter(Boolean);
      const userNames = users.map((u) => u!.name).join('、');
      addLog({
        action: 'assign',
        operator: '系统管理员',
        targetType: 'customer',
        details: `批量分配 ${ids.length} 个客户负责人为 ${userNames || result.responsiblePersonIds.join('、')}: ${names}`,
      });
    } else if (result.type === 'transfer' && result.newResponsiblePersonId) {
      batchTransfer(ids, result.newResponsiblePersonId, result.reason);
      const user = getUserById(result.newResponsiblePersonId);
      addLog({
        action: 'transfer',
        operator: '系统管理员',
        targetType: 'customer',
        details: `批量移交 ${ids.length} 个客户负责人为 ${user?.name || result.newResponsiblePersonId}: ${names}`,
      });
    }
    setDialogOpen(false);
    clearSelection();
  }, [selectedIds, customers, batchCollaborate, batchAssign, batchTransfer, addLog, clearSelection]);

  const confirmHandler = dialogCustomerId ? handleDialogConfirm : handleBatchDialogConfirm;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-[#0A0A0A]">客户管理</h1>
            <p className="text-[#5A5A5A] text-[13px]">管理所有企业客户信息，包括工商档案、半导体产业链定位和上下游关系</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-[#F5F5F5] rounded-lg p-0.5">
              <button
                onClick={() => handleViewModeChange('card')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-[#2D3BFF]' : 'text-[#999999] hover:text-[#5A5A5A]'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('table')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-[#2D3BFF]' : 'text-[#999999] hover:text-[#5A5A5A]'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => router.push('/customers/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增客户
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[280px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="text"
                placeholder="搜索客户名称、客户代码、信用代码、电话或法人..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as IndustryChainLevel | 'all')}
              className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            >
              <option value="all">全部产业链层级</option>
              <option value="upstream">上游</option>
              <option value="midstream">中游</option>
              <option value="downstream">下游</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            >
              <option value="all">全部客户状态</option>
              <option value="active">正常</option>
              <option value="inactive">停用</option>
              <option value="potential">潜在</option>
              <option value="frozen">冻结</option>
            </select>
            <select
              value={filterProgress}
              onChange={(e) => setFilterProgress(e.target.value as ProgressStatus | 'all')}
              className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            >
              <option value="all">全部跟进进度</option>
              {Object.entries(PROGRESS_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch operations toolbar */}
        {selectedIds.size > 0 && (
          <div className="bg-[#E8EBFF] border border-[#2D3BFF]/20 rounded-2xl px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#2D3BFF]">已选 {selectedIds.size} 个客户</span>
              <button onClick={clearSelection} className="text-sm text-[#5A5A5A] hover:text-[#0A0A0A]">取消选择</button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBatchAction('collaborate')}
                className="px-3 py-1.5 text-sm border border-[#2D3BFF]/30 text-[#2D3BFF] rounded-lg hover:bg-[#2D3BFF]/5 transition-colors"
              >
                批量协同
              </button>
              <button
                onClick={() => handleBatchAction('assign')}
                className="px-3 py-1.5 text-sm border border-[#2D3BFF]/30 text-[#2D3BFF] rounded-lg hover:bg-[#2D3BFF]/5 transition-colors"
              >
                批量分配
              </button>
              <button
                onClick={() => handleBatchAction('transfer')}
                className="px-3 py-1.5 text-sm border border-[#2D3BFF]/30 text-[#2D3BFF] rounded-lg hover:bg-[#2D3BFF]/5 transition-colors"
              >
                批量移交
              </button>
            </div>
          </div>
        )}

        {/* Card view */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => {
              const chainLevel = customer.semiconductorInfo?.industryChainLevel || 'upstream';
              const levelColors = INDUSTRY_CHAIN_LEVEL_COLORS[chainLevel];
              const ownerUsers = customer.responsiblePersons.map((id) => getUserById(id)).filter(Boolean);
              const createdByUser = getUserById(customer.createdBy);
              const contact = customer.basicInfo?.phone || customer.basicInfo?.email || '';
              const isSelected = selectedIds.has(customer.id);

              return (
                <div
                  key={customer.id}
                  className={`bg-white rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all group cursor-pointer hover:shadow-md ${
                    isSelected ? 'border-[#2D3BFF] ring-2 ring-[#2D3BFF]/10' : 'border-[#EBEBEB] hover:border-[#2D3BFF]/30'
                  }`}
                >
                  <div className="p-4" onClick={() => router.push(`/customers/${customer.id}`)}>
                    {/* Top row: avatar + info + status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Checkbox (stop propagation) */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(customer.id)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#2D3BFF] border-[#2D3BFF]' : 'border-[#D5D5D5]'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </label>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${levelColors.bg} ${levelColors.text}`}>
                          {customer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#0A0A0A] truncate">{customer.name}</h3>
                          <p className="text-xs text-[#999999]">客户代码: {customer.customerCode || '-'}</p>
                        </div>
                      </div>
                      <StatusBadge status={customer.status} />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelColors.bg} ${levelColors.text}`}>
                        {INDUSTRY_CHAIN_LEVEL_LABELS[chainLevel]}
                      </span>
                      <ProgressBadge status={customer.progressStatus} />
                    </div>

                    {/* Contact & owner info */}
                    <div className="space-y-1.5 mb-3 text-sm">
                      {contact && (
                        <div className="flex items-center gap-1.5 text-[#5A5A5A]">
                          <Phone className="w-3.5 h-3.5 text-[#999999]" />
                          <span className="truncate">{contact}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[#5A5A5A]">
                        <User className="w-3.5 h-3.5 text-[#999999]" />
                        {ownerUsers.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {ownerUsers.map((u) => (
                              <UserAvatar key={u!.id} userId={u!.id} size="sm" />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#999999]">未分配</span>
                        )}
                        {customer.collaborators.length > 0 && (
                          <span className="text-xs text-[#999999]">+{customer.collaborators.length} 协同</span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-[#EBEBEB] flex items-center justify-between text-xs text-[#999999]">
                      <span>{createdByUser?.name || '-'} 创建于 {customer.createdAt?.slice(0, 10)}</span>
                      {/* Actions menu (stop propagation) */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#F5F5F5] transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4 text-[#5A5A5A]" />
                        </button>
                        {openMenuId === customer.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-lg shadow-lg border border-[#EBEBEB] py-1 z-20">
                              <button
                                onClick={() => openDialog('collaborate', customer.id, customer.name, customer.responsiblePersons, customer.collaborators)}
                                className="w-full text-left px-3 py-1.5 text-sm text-[#0A0A0A] hover:bg-[#F5F5F5]"
                              >
                                协同
                              </button>
                              <button
                                onClick={() => openDialog('assign', customer.id, customer.name, customer.responsiblePersons, customer.collaborators)}
                                className="w-full text-left px-3 py-1.5 text-sm text-[#0A0A0A] hover:bg-[#F5F5F5]"
                              >
                                分配
                              </button>
                              <button
                                onClick={() => openDialog('transfer', customer.id, customer.name, customer.responsiblePersons, customer.collaborators)}
                                className="w-full text-left px-3 py-1.5 text-sm text-[#0A0A0A] hover:bg-[#F5F5F5]"
                              >
                                移交
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table view */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EBEBEB] bg-[#FAFAFA] h-[36px]">
                    <th className="w-10 px-3 py-3 text-left">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filteredCustomers.length > 0 && selectedIds.size === filteredCustomers.length}
                          onChange={toggleSelectAll}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0
                            ? 'bg-[#2D3BFF] border-[#2D3BFF]' : 'border-[#D5D5D5]'
                        }`}>
                          {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </label>
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">客户名称</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">产业链层级</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">联系人</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">联系电话</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">负责人</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">协同人</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">跟进进度</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">客户状态</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">创建时间</th>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A] w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const chainLevel = customer.semiconductorInfo?.industryChainLevel || 'upstream';
                    const levelColors = INDUSTRY_CHAIN_LEVEL_COLORS[chainLevel];
                    const ownerUsers = customer.responsiblePersons.map((id) => getUserById(id)).filter(Boolean);
                    const isSelected = selectedIds.has(customer.id);
                    const collabUsers = customer.collaborators.map(getUserById).filter(Boolean);

                    return (
                      <tr
                        key={customer.id}
                        className={`border-b border-[#EBEBEB] h-[44px] hover:bg-[#F5F5F5] transition-colors ${
                          isSelected ? 'bg-[#E8EBFF]' : ''
                        }`}
                      >
                        <td className="px-3 py-3">
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(customer.id)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#2D3BFF] border-[#2D3BFF]' : 'border-[#D5D5D5]'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </label>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => router.push(`/customers/${customer.id}`)}
                            className="text-[13px] font-medium text-[#2D3BFF] hover:underline text-left"
                          >
                            {customer.name}
                          </button>
                          <p className="text-xs text-[#999999]">{customer.customerCode || '-'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${levelColors.bg} ${levelColors.text}`}>
                            {INDUSTRY_CHAIN_LEVEL_LABELS[chainLevel]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[#0A0A0A]">
                          {customer.basicInfo?.legalRepresentative || '-'}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[#5A5A5A]">
                          {customer.basicInfo?.phone || '-'}
                        </td>
                        <td className="px-3 py-3">
                          {ownerUsers.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {ownerUsers.map((u) => (
                                <UserAvatar key={u!.id} userId={u!.id} size="sm" />
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-[#999999]">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center">
                            {collabUsers.slice(0, 3).map((u) => (
                              <div
                                key={u!.id}
                                className="w-6 h-6 rounded-full bg-[#2D3BFF] text-white text-[10px] flex items-center justify-center -ml-1 first:ml-0 border-2 border-white"
                                title={u!.name}
                              >
                                {u!.name.charAt(0)}
                              </div>
                            ))}
                            {customer.collaborators.length > 3 && (
                              <span className="text-xs text-[#999999] ml-1">+{customer.collaborators.length - 3}</span>
                            )}
                            {customer.collaborators.length === 0 && (
                              <span className="text-sm text-[#999999]">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <ProgressBadge status={customer.progressStatus} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={customer.status} />
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[#5A5A5A]">
                          {customer.createdAt?.slice(0, 10)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                              className="p-1 rounded hover:bg-[#F5F5F5]"
                            >
                              <MoreHorizontal className="w-4 h-4 text-[#5A5A5A]" />
                            </button>
                            {openMenuId === customer.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-[#EBEBEB] py-1 z-20">
                                  <button
                                    onClick={() => {
                                      router.push(`/customers/${customer.id}/edit`);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-sm text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                  >
                                    编辑
                                  </button>
                                  <button
                                    onClick={() => {
                                      openDialog('collaborate', customer.id, customer.name, customer.responsiblePersons, customer.collaborators);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-sm text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                  >
                                    协同
                                  </button>
                                  <button
                                    onClick={() => {
                                      openDialog('assign', customer.id, customer.name, customer.responsiblePersons, customer.collaborators);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-sm text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                  >
                                    分配
                                  </button>
                                  <button
                                    onClick={() => {
                                      openDialog('transfer', customer.id, customer.name, customer.responsiblePersons, customer.collaborators);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-sm text-[#0A0A0A] hover:bg-[#F5F5F5]"
                                  >
                                    移交
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredCustomers.length === 0 && (() => {
          const hasFilters = search || filterLevel !== 'all' || filterStatus !== 'all' || filterProgress !== 'all';
          if (hasFilters) {
            return (
              <SearchEmptyState
                searchQuery={search}
                onClear={() => {
                  setSearch('');
                  setFilterLevel('all');
                  setFilterStatus('all');
                  setFilterProgress('all');
                }}
              />
            );
          }
          return (
            <EmptyState
              title="暂无客户数据"
              description={'点击上方"新增客户"按钮添加第一个客户'}
              actionLabel="新增客户"
              actionHref="/customers/new"
            />
          );
        })()}

        {/* Collaboration dialog */}
        <CollaborationDialogs
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setDialogCustomerId(null); setOpenMenuId(null); }
          }}
          type={dialogType}
          customerName={dialogCustomerName}
          currentOwnerId={dialogOwnerIds[0] || ''}
          currentCollaboratorIds={dialogCollaboratorIds}
          onConfirm={confirmHandler}
        />
      </div>
    </AppLayout>
  );
}
