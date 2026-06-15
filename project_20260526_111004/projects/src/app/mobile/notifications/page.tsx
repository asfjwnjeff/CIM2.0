'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  summary: string;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

type FilterType = 'all' | 'approval_pending' | 'approval_result' | 'followup_reminder' | 'system';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string }> = {
  approval_pending: {
    label: '审批待办',
    bg: 'bg-[#FFF4E8]',
    icon: (
      <svg className="w-5 h-5 text-[#E8850C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  approval_result: {
    label: '审批结果',
    bg: 'bg-[#E6F7F0]',
    icon: (
      <svg className="w-5 h-5 text-[#0D8A5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  followup_reminder: {
    label: '跟进提醒',
    bg: 'bg-[#E8EBFF]',
    icon: (
      <svg className="w-5 h-5 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  system: {
    label: '系统通知',
    bg: 'bg-[#F5F5F5]',
    icon: (
      <svg className="w-5 h-5 text-[#5A5A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'approval_pending', label: '审批' },
  { value: 'followup_reminder', label: '提醒' },
  { value: 'system', label: '系统' },
];

export default function MobileNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = async (item: NotificationItem) => {
    // 标记已读
    if (!item.isRead) {
      try {
        await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [item.id] }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch {
        // ignore
      }
    }

    // 跳转
    if (item.targetUrl) {
      router.push(item.targetUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#0A0A0A]">消息中心</h1>
        {unreadCount > 0 && (
          <button
            className="text-xs text-[#2D3BFF] font-medium"
            onClick={handleMarkAllRead}
          >
            全部已读
          </button>
        )}
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === tab.value
                ? 'bg-[#2D3BFF] text-white'
                : 'bg-white text-[#5A5A5A] border border-[#EBEBEB]'
            }`}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 消息列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#2D3BFF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[#5A5A5A]">暂无消息</h3>
          <p className="text-xs text-[#999999] mt-1">
            {filter !== 'all' ? '当前筛选下无消息' : '还没有收到任何通知'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredNotifications.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
            return (
              <button
                key={item.id}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                  item.isRead ? 'bg-white' : 'bg-[#F8F9FF]'
                } active:bg-[#F5F5F5]`}
                onClick={() => handleClick(item)}
              >
                {/* 类型图标 */}
                <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  {config.icon}
                </div>

                {/* 消息内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${item.isRead ? 'font-medium text-[#0A0A0A]' : 'font-semibold text-[#0A0A0A]'}`}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#D63031] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#999999] mt-0.5 line-clamp-2">{item.summary}</p>
                  <span className="text-[11px] text-[#B5B5B5] mt-1 block">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                {/* 类型标签 */}
                <span className="text-[11px] text-[#999999] shrink-0 mt-0.5">
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

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
