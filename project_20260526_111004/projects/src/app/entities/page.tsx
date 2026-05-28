'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Search, Plus, FileSignature, Building2, Landmark, Trash2, Pencil } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isActive ? 'bg-[#E6F7F0] text-[#0D8A5E]' : 'bg-[#EBEBEB] text-[#5A5A5A]'
    }`}>
      {isActive ? '启用' : '停用'}
    </span>
  );
}

export default function EntitiesPage() {
  const router = useRouter();
  const { signingEntities, serviceEntities, settlementEntities, deleteSigningEntity, deleteServiceEntity, deleteSettlementEntity } = useApp();
  const [activeTab, setActiveTab] = useState('signing');
  const [searchQuery, setSearchQuery] = useState('');

  const activeSigning = signingEntities.filter((e) => e.status !== 'inactive').length;
  const inactiveSigning = signingEntities.filter((e) => e.status === 'inactive').length;
  const activeService = serviceEntities.filter((e) => e.status !== 'inactive').length;
  const inactiveService = serviceEntities.filter((e) => e.status === 'inactive').length;
  const activeSettlement = settlementEntities.filter((e) => e.status !== 'inactive').length;
  const inactiveSettlement = settlementEntities.filter((e) => e.status === 'inactive').length;

  const handleAddEntity = () => {
    if (activeTab === 'signing') router.push('/entities/signing/new');
    else if (activeTab === 'service') router.push('/entities/service/new');
    else router.push('/entities/settlement/new');
  };

  const handleEdit = (id: string) => {
    if (activeTab === 'signing') router.push(`/entities/signing/${id}/edit`);
    else if (activeTab === 'service') router.push(`/entities/service/${id}/edit`);
    else router.push(`/entities/settlement/${id}/edit`);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`确定要删除主体"${name}"吗？`)) return;
    if (activeTab === 'signing') deleteSigningEntity(id);
    else if (activeTab === 'service') deleteServiceEntity(id);
    else deleteSettlementEntity(id);
  };

  const filterBySearch = <T extends { name: string; code?: string; unifiedSocialCreditCode?: string }>(list: T[]): T[] => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.code?.toLowerCase().includes(q) ||
      e.unifiedSocialCreditCode?.toLowerCase().includes(q)
    );
  };

  const filteredSigning = filterBySearch(signingEntities);
  const filteredService = filterBySearch(serviceEntities);
  const filteredSettlement = filterBySearch(settlementEntities);

  const statCards = [
    {
      key: 'signing',
      icon: FileSignature,
      label: '签约主体',
      total: signingEntities.length,
      active: activeSigning,
      inactive: inactiveSigning,
    },
    {
      key: 'service',
      icon: Building2,
      label: '服务主体',
      total: serviceEntities.length,
      active: activeService,
      inactive: inactiveService,
    },
    {
      key: 'settlement',
      icon: Landmark,
      label: '结算主体',
      total: settlementEntities.length,
      active: activeSettlement,
      inactive: inactiveSettlement,
    },
  ];

  const renderTable = (
    data: any[],
    columns: { key: string; label: string; render: (row: any) => React.ReactNode }[],
    emptyText: string,
  ) => {
    if (data.length === 0) {
      return (
        <div className="text-center text-[#999999] py-12 text-sm">{emptyText}</div>
      );
    }
    return (
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#EBEBEB] bg-[#FAFAFA] h-[36px]">
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">{col.label}</th>
            ))}
            <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A] w-[120px]">操作</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-[#EBEBEB] h-[44px] hover:bg-[#F5F5F5] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-3 text-[13px] text-[#5A5A5A]">
                  {col.render(row)}
                </td>
              ))}
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(row.id)}
                    className="text-[#2D3BFF] text-[13px] font-medium hover:underline"
                  >
                    <Pencil className="w-3.5 h-3.5 inline mr-0.5" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(row.id, row.name)}
                    className="text-[#D63031] text-[13px] font-medium hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline mr-0.5" />
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const signingColumns = [
    { key: 'name', label: '主体名称', render: (r: any) => <span className="font-medium text-[#0A0A0A]">{r.name}</span> },
    { key: 'code', label: '主体代码', render: (r: any) => <span className="font-mono text-xs">{r.code || '-'}</span> },
    { key: 'unifiedSocialCreditCode', label: '统一社会信用代码', render: (r: any) => <span className="font-mono text-xs">{r.unifiedSocialCreditCode || '-'}</span> },
    { key: 'contactPerson', label: '联系人', render: (r: any) => r.contactPerson || '-' },
    { key: 'phone', label: '联系电话', render: (r: any) => r.phone || '-' },
    { key: 'status', label: '状态', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: '创建时间', render: (r: any) => r.createdAt?.slice(0, 10) || '-' },
  ];

  const serviceColumns = [
    { key: 'name', label: '主体名称', render: (r: any) => <span className="font-medium text-[#0A0A0A]">{r.name}</span> },
    { key: 'code', label: '主体代码', render: (r: any) => <span className="font-mono text-xs">{r.code || '-'}</span> },
    { key: 'unifiedSocialCreditCode', label: '统一社会信用代码', render: (r: any) => <span className="font-mono text-xs">{r.unifiedSocialCreditCode || '-'}</span> },
    { key: 'contactPerson', label: '联系人', render: (r: any) => r.contactPerson || '-' },
    { key: 'phone', label: '联系电话', render: (r: any) => r.phone || '-' },
    { key: 'status', label: '状态', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: '创建时间', render: (r: any) => r.createdAt?.slice(0, 10) || '-' },
  ];

  const settlementColumns = [
    { key: 'name', label: '主体名称', render: (r: any) => <span className="font-medium text-[#0A0A0A]">{r.name}</span> },
    { key: 'code', label: '主体代码', render: (r: any) => <span className="font-mono text-xs">{r.code || '-'}</span> },
    { key: 'unifiedSocialCreditCode', label: '统一社会信用代码', render: (r: any) => <span className="font-mono text-xs">{r.unifiedSocialCreditCode || '-'}</span> },
    { key: 'bankName', label: '开户银行', render: (r: any) => r.bankName || '-' },
    { key: 'bankAccount', label: '银行账号', render: (r: any) => <span className="font-mono text-xs">{r.bankAccount || '-'}</span> },
    { key: 'currency', label: '币种', render: (r: any) => r.currency || '-' },
    { key: 'status', label: '状态', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: '创建时间', render: (r: any) => r.createdAt?.slice(0, 10) || '-' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[13px] text-[#999999] mb-1">
            <span>首页</span>
            <span className="text-[#D5D5D5]">/</span>
            <span>主体管理</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">主体管理</h1>
          <p className="text-[#5A5A5A] text-[13px] mt-0.5">管理签约主体、服务主体和结算主体信息</p>
        </div>
        <button
          onClick={handleAddEntity}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增主体
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              onClick={() => setActiveTab(card.key)}
              className={`bg-white rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 cursor-pointer transition-all hover:shadow-md ${
                activeTab === card.key ? 'border-[#2D3BFF] ring-2 ring-[#2D3BFF]/10' : 'border-[#EBEBEB]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-[#5A5A5A] mb-0.5">{card.label}</div>
                  <div className="text-[28px] font-bold text-[#0A0A0A] tracking-tight">{card.total}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeTab === card.key ? 'bg-[#2D3BFF] text-white' : 'bg-[#F5F5F5] text-[#5A5A5A]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-[#EBEBEB]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#0D8A5E]" />
                  <span className="text-xs text-[#5A5A5A]">启用 <span className="font-medium text-[#0A0A0A]">{card.active}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#999999]" />
                  <span className="text-xs text-[#5A5A5A]">停用 <span className="font-medium text-[#0A0A0A]">{card.inactive}</span></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#EBEBEB] px-5">
          <div className="flex items-center">
            {[
              { key: 'signing', label: '签约主体', count: signingEntities.length },
              { key: 'service', label: '服务主体', count: serviceEntities.length },
              { key: 'settlement', label: '结算主体', count: settlementEntities.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#2D3BFF] text-[#2D3BFF]'
                    : 'border-transparent text-[#5A5A5A] hover:text-[#0A0A0A]'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${
                  activeTab === tab.key ? 'text-[#2D3BFF]' : 'text-[#999999]'
                }`}>({tab.count})</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              type="text"
              placeholder="搜索主体名称、代码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-9 pr-3 py-2 h-[34px] border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'signing' && renderTable(filteredSigning, signingColumns, '暂无签约主体数据')}
          {activeTab === 'service' && renderTable(filteredService, serviceColumns, '暂无服务主体数据')}
          {activeTab === 'settlement' && renderTable(filteredSettlement, settlementColumns, '暂无结算主体数据')}
        </div>
      </div>
    </div>
  );
}
