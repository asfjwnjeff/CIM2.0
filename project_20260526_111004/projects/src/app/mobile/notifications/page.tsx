'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/mobile/ConfirmDialog';
import { formatRelativeTime } from '@/lib/mobile-utils';

interface NotificationItem { id: string; type: string; title: string; summary: string; targetUrl?: string; isRead: boolean; createdAt: string; }
type FilterType = 'all' | 'approval_pending' | 'approval_result' | 'system';

const TYPE_CONFIG: Record<string, { label: string; bg: string }> = {
  approval_pending: { label: '审批待办', bg: 'bg-[#FFF4E8]' },
  approval_result: { label: '审批结果', bg: 'bg-[#E6F7F0]' },
  system: { label: '系统通知', bg: 'bg-[#F5F5F5]' },
};
const TYPE_ICONS: Record<string, string> = {
  approval_pending: '📋', approval_result: '✅', system: 'ℹ️',
};

export default function MobileNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reminders, setReminders] = useState<Array<{customerId:string;customerName:string;level:string;overdueDays:number}>>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [confirmMarkAll, setConfirmMarkAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [notifRes, remRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/followup-reminders'),
      ]);
      const notifData = await notifRes.json();
      const remData = await remRes.json();
      if (notifData.success && Array.isArray(notifData.data)) setNotifications(notifData.data);
      if (Array.isArray(remData)) setReminders(remData);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [item.id] }) });
        setNotifications((p) => p.map((n) => n.id === item.id ? { ...n, isRead: true } : n));
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      } catch (e) { console.error('[消息] 标记已读失败:', e); }
    }
    if (item.targetUrl) router.push(item.targetUrl);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
      setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
      toast.success('已全部标记为已读');
    } catch (e) { console.error('[消息] 全部已读失败:', e); toast.error('操作失败'); }
    setConfirmMarkAll(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#0A0A0A]">消息中心</h1>
        <button
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${unreadCount > 0 ? 'text-[#2D3BFF] bg-[#E8EBFF] active:bg-[#D0D5FF]' : 'text-[#B5B5B5] bg-[#F5F5F5] cursor-not-allowed'}`}
          onClick={() => unreadCount > 0 && setConfirmMarkAll(true)}
        >全部已读</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ value: 'all', label: '全部' }, { value: 'approval_pending', label: '审批待办' }, { value: 'approval_result', label: '审批结果' }, { value: 'system', label: '系统' }].map((t) => (
          <button key={t.value} className={`shrink-0 px-4 py-1 rounded-full text-xs font-medium ${filter === t.value ? 'bg-[#2D3BFF] text-white' : 'bg-white text-[#5A5A5A] border border-[#EBEBEB]'}`} onClick={() => setFilter(t.value as FilterType)}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#2D3BFF] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4"><span className="text-2xl">🔔</span></div>
          <h3 className="text-sm font-medium text-[#5A5A5A]">暂无消息</h3>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((item) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
            return (
              <button key={item.id} className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left active:bg-[#F5F5F5] ${item.isRead ? 'bg-white' : 'bg-[#F8F9FF]'}`} onClick={() => handleClick(item)}>
                <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 text-lg`}>{TYPE_ICONS[item.type] || '📌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className={`text-sm ${item.isRead ? 'font-medium text-[#0A0A0A]' : 'font-semibold text-[#0A0A0A]'}`}>{item.title}</span>{!item.isRead && <span className="w-2 h-2 rounded-full bg-[#D63031] shrink-0" />}</div>
                  <p className="text-xs text-[#999999] mt-0.5 line-clamp-2">{item.summary}</p>
                  <span className="text-xs text-[#B5B5B5] mt-1 block">{formatRelativeTime(item.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="h-4" />

      {!loading && reminders.length > 0 && filter === 'all' && (
        <>
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-sm font-semibold text-[#0A0A0A]">待跟进提醒</h2>
            <span className="text-xs text-[#999999]">{reminders.length}</span>
          </div>
          <div className="space-y-1">
            {reminders.map((item) => (
              <button key={item.customerId} className="w-full flex items-center justify-between bg-white rounded-xl border border-[#EBEBEB] px-4 py-3 active:bg-[#F5F5F5] text-left" onClick={() => router.push('/mobile/followups')}>
                <div>
                  <div className="text-sm font-medium text-[#0A0A0A]">{item.customerName}</div>
                  <div className="text-xs text-[#D63031] mt-0.5">已逾期 {item.overdueDays} 天</div>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#F5F5F5] text-[#5A5A5A] font-medium">{item.level}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog open={confirmMarkAll} title="标记全部已读" message="确定将所有消息标记为已读吗？" confirmLabel="全部已读" onConfirm={handleMarkAllRead} onCancel={() => setConfirmMarkAll(false)} />
    </div>
  );
}
