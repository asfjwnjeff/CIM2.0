'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import type { FollowUpType } from '@/lib/types';
import { formatShortDateTime, getFollowupTypeLabel, getFollowupMethodLabel, getFollowupStatusColor } from '@/lib/mobile-utils';

const STATUS_LABELS: Record<string, string> = {
  'new': '新建需求', 'discussing': '沟通方案', 'promoting': '促单', 'success': '成功',
  'no_progress': '无进展', 'cancelled': '需求取消', 'terminated': '合同终止', 'failed': '失败',
};
const TYPE_LABELS: Record<string, string> = {
  'kpi_not_met': 'KPI未达标', 'contract_mgmt': '合同管理', 'biz_meeting': '业务会议', 'other_customer': '其他客户事项',
};
type FilterType = 'all' | FollowUpType;

export default function MobileFollowupsPage() {
  const router = useRouter();
  const { followUps, customers } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');

  const enriched = useMemo(() => {
    let list = followUps.map((f) => {
      const customer = customers.find((c) => c.id === f.customerId);
      return { ...f, displayCustomerName: f.customerName || customer?.name || '未知客户', displayDate: f.followUpDate || f.date || f.createdAt, displayType: f.type || f.followUpType || 'other_customer' };
    });
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter((f) => f.displayCustomerName?.toLowerCase().includes(kw) || f.content?.toLowerCase().includes(kw));
    }
    if (typeFilter !== 'all') list = list.filter((f) => f.displayType === typeFilter);
    return list.sort((a, b) => (b.displayDate || '').localeCompare(a.displayDate || ''));
  }, [followUps, customers, search, typeFilter]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#0A0A0A]">客户跟进</h1>
        <button className="w-10 h-10 bg-[#2D3BFF] text-white rounded-lg flex items-center justify-center active:bg-[#4338CA]" onClick={() => router.push('/mobile/followups/new')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input className="w-full h-10 pl-9 pr-8 bg-white border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF]" placeholder="搜索客户名或跟进内容..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#999999]" onClick={() => setSearch('')}>✕</button>}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip label="全部" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
        {Object.entries(TYPE_LABELS).map(([val, label]) => <FilterChip key={val} label={label} active={typeFilter === val} onClick={() => setTypeFilter(val as FollowUpType)} />)}
      </div>

      {enriched.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4"><svg className="w-8 h-8 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
          <h3 className="text-sm font-medium text-[#5A5A5A]">暂无跟进记录</h3>
          <p className="text-xs text-[#999999] mt-1">{search ? '当前搜索无结果' : '点击右上角 + 添加新跟进'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enriched.map((f) => (
            <button key={f.id} className="w-full bg-white rounded-xl border border-[#EBEBEB] px-4 py-3.5 active:bg-[#F5F5F5] text-left" onClick={() => router.push(`/mobile/followups/${f.id}`)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0A0A0A] truncate flex-1 mr-2">{f.displayCustomerName}</span>
                {f.status && <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getFollowupStatusColor(f.status)}`}>{STATUS_LABELS[f.status] || f.status}</span>}
              </div>
              {f.content && <p className="text-xs text-[#5A5A5A] mt-1.5 line-clamp-2">{f.content}</p>}
              <div className="flex items-center gap-2 mt-2 text-xs text-[#999999] flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-[#E8EBFF] text-[#2D3BFF] font-medium">{getFollowupTypeLabel(f.displayType)}</span>
                {(f.method || (f as any).followUpMethod) && <span>{getFollowupMethodLabel((f.method || (f as any).followUpMethod) as string)}</span>}
                <span className="w-1 h-1 rounded-full bg-[#D5D5D5]" />
                <span>{formatShortDateTime(f.displayDate || '')}</span>
                {f.contactName && <><span className="w-1 h-1 rounded-full bg-[#D5D5D5]" /><span>{f.contactName}</span></>}
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className={`shrink-0 px-4 py-1 rounded-full text-xs font-medium transition-colors ${active ? 'bg-[#2D3BFF] text-white' : 'bg-white text-[#5A5A5A] border border-[#EBEBEB]'}`} onClick={onClick}>{label}</button>;
}
