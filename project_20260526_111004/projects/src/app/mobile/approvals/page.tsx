'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import ApprovalCard from '@/components/mobile/ApprovalCard';

type FilterStatus = 'all' | 'in_review' | 'approved' | 'rejected' | 'draft';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'in_review', label: '审批中' },
  { value: 'approved', label: '已完成' },
  { value: 'rejected', label: '已驳回' },
  { value: 'draft', label: '草稿' },
];

export default function MobileApprovalsPage() {
  const router = useRouter();
  const { riskApprovals } = useApp();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const filteredApprovals = useMemo(() => {
    let list = riskApprovals;

    // 状态筛选
    if (filter !== 'all') {
      list = list.filter((a) => {
        const s = a.approvalStatus || a.status;
        // 中文状态映射
        const statusMap: Record<string, string> = {
          '草稿': 'draft',
          '审批中': 'in_review',
          '审批完成': 'approved',
          '已驳回': 'rejected',
        };
        return (statusMap[s] || s) === filter;
      });
    }

    // 搜索
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.companyName?.toLowerCase().includes(kw) ||
          a.serviceProduct?.toLowerCase().includes(kw)
      );
    }

    // 按更新时间倒序
    return [...list].sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || '';
      const dateB = b.updatedAt || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  }, [riskApprovals, filter, search]);

  return (
    <div className="flex flex-col gap-3">
      {/* 页面标题 */}
      <h1 className="text-lg font-bold text-[#0A0A0A]">审批中心</h1>

      {/* 搜索框 */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          className="w-full h-10 pl-9 pr-4 bg-white border border-[#EBEBEB] rounded-lg text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-1 focus:ring-[#2D3BFF]"
          placeholder="搜索公司名称或服务产品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#999999] hover:text-[#0A0A0A]"
            onClick={() => setSearch('')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === opt.value
                ? 'bg-[#2D3BFF] text-white'
                : 'bg-white text-[#5A5A5A] border border-[#EBEBEB]'
            }`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 审批列表 */}
      {filteredApprovals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[#5A5A5A]">暂无审批记录</h3>
          <p className="text-xs text-[#999999] mt-1">
            {filter !== 'all' ? '当前筛选条件下无结果' : '还没有任何审批申请'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              id={approval.id}
              companyName={approval.companyName}
              serviceProduct={approval.serviceProduct}
              status={approval.status}
              approvalStatus={approval.approvalStatus}
              updatedAt={approval.updatedAt}
              createdAt={approval.createdAt}
              onClick={() => router.push(`/mobile/approvals/${approval.id}`)}
            />
          ))}
        </div>
      )}

      {/* 底部留白（底部导航栏遮挡） */}
      <div className="h-4" />
    </div>
  );
}
