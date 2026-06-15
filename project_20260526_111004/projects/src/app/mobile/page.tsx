'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import type { RiskApproval } from '@/lib/types';

interface DashboardData {
  pendingApprovalCount: number;
  todayFollowupCount: number;
  overdueReminderCount: number;
  recentApprovals: RiskApproval[];
  unreadNotificationCount: number;
}

/* ====== 内联图标 ====== */
const Icons = {
  Clipboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  StickyNote: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

export default function MobileHomePage() {
  const router = useRouter();
  const { riskApprovals, currentUser } = useApp();
  const [dashboard, setDashboard] = useState<DashboardData>({
    pendingApprovalCount: 0,
    todayFollowupCount: 0,
    overdueReminderCount: 0,
    recentApprovals: [],
    unreadNotificationCount: 0,
  });
  const [reminders, setReminders] = useState<Array<{customerId:string;customerName:string;level:string;overdueDays:number}>>([]);

  useEffect(() => {
    // 从 store 计算待审批数
    const pending = riskApprovals.filter(
      (a) => a.status === 'in_review' || a.approvalStatus === '审批中'
    );
    setDashboard((prev) => ({
      ...prev,
      pendingApprovalCount: pending.length,
      recentApprovals: riskApprovals.slice(0, 3),
    }));

    // 获取跟进提醒
    fetch('/api/followup-reminders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReminders(data.slice(0, 3));
          setDashboard((prev) => ({ ...prev, overdueReminderCount: data.length }));
        }
      })
      .catch(() => {});
  }, [riskApprovals]);

  const statCards = [
    {
      label: '待审批',
      value: dashboard.pendingApprovalCount,
      color: 'text-[#E8850C]',
      bg: 'bg-[#FFF4E8]',
      href: '/mobile/approvals',
    },
    {
      label: '今日待跟进',
      value: dashboard.todayFollowupCount,
      color: 'text-[#2D3BFF]',
      bg: 'bg-[#E8EBFF]',
      href: '/mobile/followups',
    },
    {
      label: '逾期提醒',
      value: dashboard.overdueReminderCount,
      color: 'text-[#D63031]',
      bg: 'bg-[#FFEBEE]',
      href: '/mobile/followups',
    },
    {
      label: '未读消息',
      value: dashboard.unreadNotificationCount,
      color: 'text-[#0D8A5E]',
      bg: 'bg-[#E6F7F0]',
      href: '/mobile/notifications',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 欢迎区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0A0A0A]">你好，{currentUser.name}</h1>
          <p className="text-sm text-[#999999] mt-0.5">{currentUser.department || ''}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#2D3BFF] flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{currentUser.name[0]}</span>
        </div>
      </div>

      {/* 统计卡片 - 2x2 网格 */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <button
            key={card.label}
            className="bg-white rounded-xl p-4 border border-[#EBEBEB] active:bg-[#F5F5F5] transition-colors text-left"
            onClick={() => router.push(card.href)}
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
              <span className={`${card.color} font-bold text-sm`}>{card.value}</span>
            </div>
            <div className="text-sm text-[#5A5A5A]">{card.label}</div>
          </button>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="flex items-center gap-2 bg-[#2D3BFF] text-white rounded-xl px-4 py-3 active:bg-[#4338CA] transition-colors"
          onClick={() => router.push('/mobile/approvals/new')}
        >
          <Icons.Plus />
          <span className="text-sm font-medium">新建审批</span>
        </button>
        <button
          className="flex items-center gap-2 bg-white text-[#0A0A0A] rounded-xl px-4 py-3 border border-[#EBEBEB] active:bg-[#F5F5F5] transition-colors"
          onClick={() => router.push('/mobile/followups/new')}
        >
          <Icons.StickyNote />
          <span className="text-sm font-medium">新建跟进</span>
        </button>
      </div>

      {/* 待审批列表 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-1.5">
            <Icons.Clipboard />
            待审批
          </h2>
          <button
            className="text-xs text-[#2D3BFF] font-medium flex items-center gap-0.5"
            onClick={() => router.push('/mobile/approvals')}
          >
            全部 <Icons.ChevronRight />
          </button>
        </div>
        {dashboard.recentApprovals.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBEBEB] px-4 py-8 text-center text-sm text-[#999999]">
            暂无待审批事项
          </div>
        ) : (
          <div className="space-y-2">
            {dashboard.recentApprovals.map((approval) => (
              <button
                key={approval.id}
                className="w-full bg-white rounded-xl border border-[#EBEBEB] px-4 py-3 active:bg-[#F5F5F5] transition-colors text-left"
                onClick={() => router.push(`/mobile/approvals/${approval.id}`)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#0A0A0A] truncate flex-1 mr-2">
                    {approval.companyName || '未命名审批'}
                  </span>
                  <StatusBadgeSmall status={approval.approvalStatus || approval.status} />
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#999999]">
                  {approval.serviceProduct && <span>{approval.serviceProduct}</span>}
                  {approval.updatedAt && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[#D5D5D5]" />
                      <span>{formatRelativeTime(approval.updatedAt)}</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 跟进提醒列表 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-1.5">
            <Icons.Bell />
            跟进提醒
          </h2>
          <button
            className="text-xs text-[#2D3BFF] font-medium flex items-center gap-0.5"
            onClick={() => router.push('/mobile/followups')}
          >
            全部 <Icons.ChevronRight />
          </button>
        </div>
        {reminders.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EBEBEB] px-4 py-8 text-center text-sm text-[#999999]">
            暂无逾期提醒
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((item) => (
              <div
                key={item.customerId}
                className="bg-white rounded-xl border border-[#EBEBEB] px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-[#0A0A0A]">{item.customerName}</div>
                  <div className="text-xs text-[#D63031] mt-0.5">已逾期 {item.overdueDays} 天</div>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#F5F5F5] text-[#5A5A5A] font-medium">
                  {item.level}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== 小状态标签 ====== */
function StatusBadgeSmall({ status }: { status: string }) {
  const STATUS_MAP: Record<string, { label: string; style: string }> = {
    'draft': { label: '草稿', style: 'bg-[#F5F5F5] text-[#5A5A5A]' },
    'in_review': { label: '审批中', style: 'bg-[#E8EBFF] text-[#2D3BFF]' },
    'approved': { label: '已完成', style: 'bg-[#E6F7F0] text-[#0D8A5E]' },
    'rejected': { label: '已驳回', style: 'bg-[#FFEBEE] text-[#D63031]' },
    '草稿': { label: '草稿', style: 'bg-[#F5F5F5] text-[#5A5A5A]' },
    '审批中': { label: '审批中', style: 'bg-[#E8EBFF] text-[#2D3BFF]' },
    '审批完成': { label: '已完成', style: 'bg-[#E6F7F0] text-[#0D8A5E]' },
    '已驳回': { label: '已驳回', style: 'bg-[#FFEBEE] text-[#D63031]' },
  };
  const config = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${config.style}`}>
      {config.label}
    </span>
  );
}

/* ====== 相对时间格式化 ====== */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
