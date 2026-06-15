'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import StatusBadge from '@/components/mobile/StatusBadge';
import { SkeletonList } from '@/components/mobile/Skeleton';
import { formatRelativeTime } from '@/lib/mobile-utils';

export default function MobileHomePage() {
  const router = useRouter();
  const { riskApprovals, currentUser, followUps } = useApp();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({ pendingApprovalCount: 0, todayFollowupCount: 0, overdueReminderCount: 0, unreadNotificationCount: 0 });
  const [reminders, setReminders] = useState<Array<{customerId:string;customerName:string;level:string;overdueDays:number}>>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const pending = riskApprovals.filter((a) => a.status === 'in_review' || a.approvalStatus === '审批中');
      const today = followUps.filter((f) => {
        const d = f.followUpDate || f.date;
        return d && d.slice(0, 10) === new Date().toISOString().slice(0, 10);
      });

      const [remRes, notifRes] = await Promise.all([
        fetch('/api/followup-reminders').then((r) => r.json()).catch(() => []),
        fetch('/api/notifications?unreadOnly=true').then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const reminderList = Array.isArray(remRes) ? remRes : [];
      const unreadCount = notifRes?.data?.length || 0;

      setDashboard({
        pendingApprovalCount: pending.length,
        todayFollowupCount: today.length,
        overdueReminderCount: reminderList.length,
        unreadNotificationCount: unreadCount,
      });
      setReminders(reminderList.slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, [riskApprovals, followUps]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="py-4"><SkeletonList count={4} /></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0A0A0A]">你好，{currentUser.name}</h1>
          <p className="text-sm text-[#999999] mt-0.5">{currentUser.department || ''}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#2D3BFF] flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{currentUser.name[0]}</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="待审批" value={dashboard.pendingApprovalCount} color="warning" href="/mobile/approvals" onClick={() => router.push('/mobile/approvals')} />
        <StatCard label="今日待跟进" value={dashboard.todayFollowupCount} color="info" href="/mobile/followups" onClick={() => router.push('/mobile/followups')} />
        <StatCard label="逾期提醒" value={dashboard.overdueReminderCount} color="danger" emphasis href="/mobile/followups" onClick={() => router.push('/mobile/followups')} />
        <StatCard label="未读消息" value={dashboard.unreadNotificationCount} color="success" href="/mobile/notifications" onClick={() => router.push('/mobile/notifications')} />
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center gap-2 bg-[#2D3BFF] text-white rounded-xl px-4 py-3 active:bg-[#4338CA]" onClick={() => router.push('/mobile/approvals/new')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="text-sm font-medium">新建审批</span>
        </button>
        <button className="flex items-center gap-2 bg-white text-[#0A0A0A] rounded-xl px-4 py-3 border border-[#EBEBEB] active:bg-[#F5F5F5]" onClick={() => router.push('/mobile/followups/new')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          <span className="text-sm font-medium">新建跟进</span>
        </button>
      </div>

      {/* 待审批列表 */}
      <ListSection title="待审批" href="/mobile/approvals" empty="暂无待审批事项">
        {riskApprovals.filter((a) => a.status === 'in_review' || a.approvalStatus === '审批中').slice(0, 3).map((a) => (
          <button key={a.id} className="w-full bg-white rounded-xl border border-[#EBEBEB] px-4 py-3 active:bg-[#F5F5F5] text-left" onClick={() => router.push(`/mobile/approvals/${a.id}`)}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#0A0A0A] truncate flex-1 mr-2">{a.companyName || '未命名审批'}</span>
              <StatusBadge status={a.approvalStatus || a.status} />
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#999999]">
              {a.serviceProduct && <span>{a.serviceProduct}</span>}
              {a.updatedAt && <><span className="w-1 h-1 rounded-full bg-[#D5D5D5]" /><span>{formatRelativeTime(a.updatedAt)}</span></>}
            </div>
          </button>
        ))}
      </ListSection>

      {/* 跟进提醒 */}
      <ListSection title="跟进提醒" href="/mobile/followups" empty="暂无逾期提醒">
        {reminders.map((item) => (
          <button key={item.customerId} className="w-full bg-white rounded-xl border border-[#EBEBEB] px-4 py-3 flex items-center justify-between active:bg-[#F5F5F5] text-left" onClick={() => router.push(`/mobile/followups`)}>
            <div>
              <div className="text-sm font-medium text-[#0A0A0A]">{item.customerName}</div>
              <div className="text-xs text-[#D63031] mt-0.5">已逾期 {item.overdueDays} 天</div>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#F5F5F5] text-[#5A5A5A] font-medium">{item.level}</span>
          </button>
        ))}
      </ListSection>
    </div>
  );
}

function StatCard({ label, value, color, emphasis, onClick }: { label: string; value: number; color: 'warning'|'info'|'danger'|'success'; emphasis?: boolean; href: string; onClick: () => void }) {
  const colors = { warning: 'bg-[#FFF4E8] text-[#E8850C]', info: 'bg-[#E8EBFF] text-[#2D3BFF]', danger: 'bg-[#FFEBEE] text-[#D63031]', success: 'bg-[#E6F7F0] text-[#0D8A5E]' };
  return (
    <button className={`bg-white rounded-xl p-4 border active:bg-[#F5F5F5] text-left ${emphasis ? 'border-[#D63031]/30' : 'border-[#EBEBEB]'}`} onClick={onClick}>
      <div className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-2 font-bold text-sm`}>{value}</div>
      <div className={`text-sm ${emphasis ? 'text-[#D63031] font-medium' : 'text-[#5A5A5A]'}`}>{label}</div>
    </button>
  );
}

function ListSection({ title, href, empty, children }: { title: string; href: string; empty: string; children: React.ReactNode }) {
  const router = useRouter();
  const childArr = React.Children.toArray(children);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-[#0A0A0A]">{title}</h2>
        <button className="text-xs text-[#2D3BFF] font-medium" onClick={() => router.push(href)}>全部 →</button>
      </div>
      {childArr.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EBEBEB] px-4 py-8 text-center text-sm text-[#999999]">{empty}</div>
      ) : <div className="space-y-2">{children}</div>}
    </div>
  );
}
