'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: number;
}

const TabIcons = {
  Home: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  ),
  Clipboard: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Bell: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  StickyNote: (active: boolean) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
};

const TABS: TabItem[] = [
  { label: '首页', href: '/mobile', icon: TabIcons.Home },
  { label: '风控', href: '/mobile/approvals', icon: TabIcons.Clipboard },
  { label: '消息', href: '/mobile/notifications', icon: TabIcons.Bell },
  { label: '跟进', href: '/mobile/followups', icon: TabIcons.StickyNote },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchUnread = () => {
      fetch('/api/notifications?unreadOnly=true')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) setUnreadCount(data.data.length);
        })
        .catch(() => {});
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 30000);
    return () => clearInterval(t);
  }, []);

  const isActive = (href: string) => {
    if (href === '/mobile') return pathname === '/mobile';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EBEBEB] flex items-center justify-around"
      style={{
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              active ? 'text-[#2D3BFF]' : 'text-[#999999]'
            }`}
          >
            <div className="relative">
              {tab.icon(active)}
              {(tab.label === '消息' ? unreadCount : tab.badge || 0) > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-[#D63031] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
                  {tab.label === '消息' ? (unreadCount > 99 ? '99+' : unreadCount) : (tab.badge && tab.badge > 99 ? '99+' : tab.badge)}
                </span>
              )}
            </div>
            <span className={`text-[11px] font-medium ${active ? 'font-semibold' : ''}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
