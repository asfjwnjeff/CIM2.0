'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/mobile/ConfirmDialog';
import { formatRelativeTime } from '@/lib/mobile-utils';

interface NotificationItem { id: string; type: string; title: string; summary: string; targetUrl?: string; isRead: boolean; createdAt: string; }
type FilterType = 'all' | 'approval_pending' | 'followup_reminder' | 'system';

const TYPE_CONFIG: Record<string, { label: string; bg: string }> = {
  approval_pending: { label: '审批待办', bg: 'bg-[#FFF4E8]' },
  approval_result: { label: '审批结果', bg: 'bg-[#E6F7F0]' },
  followup_reminder: { label: '跟进提醒', bg: 'bg-[#E8EBFF]' },
  system: { label: '系统通知', bg: 'bg-[#F5F5F5]' },
};
const TYPE_ICONS: Record<string, string> = {
  approval_pending: '📋', approval_result: '✅', followup_reminder: '🔔', system: 'ℹ️',
};

export default function MobileNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [confirmMarkAll, setConfirmMarkAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setNotifications(data.data);
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
      } catch {}
    }
    if (item.targetUrl) router.push(item.targetUrl);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
      setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
      toast.success('已全部标记为已读');
    } catch { toast.error('操作失败'); }
    setConfirmMarkAll(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#0A0A0A]">消息中心</h1>
        {unreadCount > 0 && <button className="text-xs text-[#2D3BFF] font-medium" onClick={() => setConfirmMarkAll(true)}>全部已读</button>}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ value: 'all', label: '全部' }, { value: 'approval_pending', label: '审批' }, { value: 'followup_reminder', label: '提醒' }, { value: 'system', label: '系统' }].map((t) => (
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

      <ConfirmDialog open={confirmMarkAll} title="标记全部已读" message="确定将所有消息标记为已读吗？" confirmLabel="全部已读" onConfirm={handleMarkAllRead} onCancel={() => setConfirmMarkAll(false)} />
    </div>
  );
}
