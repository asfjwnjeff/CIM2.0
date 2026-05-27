'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

/* ====== 极简 SVG 图标 (14个, strokeWidth 1.5) ====== */

const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  StickyNote: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-3.5 h-3.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
};

/* ====== 导航菜单配置 ====== */

const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '/', icon: <Icons.Dashboard /> },
  { label: '客户管理', href: '/customers', icon: <Icons.Users /> },
  { label: '客户跟进', href: '/followup', icon: <Icons.StickyNote /> },
  { label: '商机管理', href: '/opportunities', icon: <Icons.Briefcase /> },
  { label: '售前报价', href: '/quotes', icon: <Icons.FileText /> },
  {
    label: '风控审批', href: '/approvals', icon: <Icons.ShieldCheck />,
    children: [
      { label: '审批列表', href: '/approvals', icon: <Icons.ShieldCheck /> },
      { label: '流程配置', href: '/approval/workflows', icon: <Icons.Settings /> },
      { label: '自动规则', href: '/approval/auto-rules', icon: <Icons.Settings /> },
    ],
  },
  {
    label: '主体管理', href: '/entities', icon: <Icons.Building />,
    children: [
      { label: '服务主体', href: '/entities/service', icon: <Icons.Building /> },
      { label: '签约主体', href: '/entities/signing', icon: <Icons.FileText /> },
      { label: '结算主体', href: '/entities/settlement', icon: <Icons.Clipboard /> },
    ],
  },
  { label: '规则配置', href: '/rules', icon: <Icons.Settings /> },
  {
    label: '系统管理', href: '/settings', icon: <Icons.Settings />,
    children: [
      { label: '字典管理', href: '/settings/dictionary', icon: <Icons.Clipboard /> },
      { label: '接口管理', href: '/settings/api', icon: <Icons.Settings /> },
    ],
  },
  {
    label: '权限管理', href: '/settings/permissions', icon: <Icons.Shield />,
    children: [
      { label: '角色管理', href: '/settings/roles', icon: <Icons.Users /> },
      { label: '用户管理', href: '/settings/users', icon: <Icons.Users /> },
      { label: '功能管理', href: '/settings/functions', icon: <Icons.Settings /> },
      { label: '数据权限管理', href: '/settings/data-permissions', icon: <Icons.Shield /> },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isChildActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some(child => pathname.startsWith(child.href));
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  /* 自动展开包含当前路径的菜单 */
  useEffect(() => {
    NAV_ITEMS.forEach(item => {
      if (item.children?.some(child => pathname.startsWith(child.href)) && !expandedMenus.includes(item.label)) {
        setExpandedMenus(prev => [...prev, item.label]);
      }
    });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 点击侧栏外部关闭展开面板 */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node) && sidebarExpanded) {
        setSidebarExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarExpanded]);

  /* Esc 关闭侧栏 */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && sidebarExpanded) setSidebarExpanded(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarExpanded]);

  const sidebarWidth = sidebarExpanded ? 'w-[240px]' : 'w-[56px]';

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ====== 顶栏 (纯白 + 底部细线) ====== */}
      <header className="h-[55px] bg-white border-b border-[#EBEBEB] flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors text-[#0A0A0A]"
            aria-label={sidebarExpanded ? '收起侧栏' : '展开侧栏'}
          >
            <Icons.Menu />
          </button>
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-[18px] font-bold tracking-tight text-[#0A0A0A]">
              CIM <span className="font-normal text-[#5A5A5A]">2.0</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* 全局搜索按钮 */}
          <button
            className="hidden sm:flex items-center gap-2 h-8 px-3 text-xs text-[#999999] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-md transition-colors border border-transparent hover:border-[#D5D5D5]"
            onClick={() => {/* 预留 Cmd+K 全局搜索 */}}
          >
            <Icons.Search />
            <span>搜索...</span>
            <kbd className="ml-2 text-[10px] px-1 py-0.5 rounded bg-white border border-[#EBEBEB] text-[#999999]">
              ⌘K
            </kbd>
          </button>

          {/* 通知 */}
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors text-[#5A5A5A]">
            <Icons.Bell />
          </button>

          {/* 用户 */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-[#EBEBEB]">
            <span className="text-sm text-[#0A0A0A] font-medium hidden sm:block">
              {currentUser.name}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#2D3BFF] flex items-center justify-center">
              <span className="text-xs font-semibold text-white">{currentUser.name[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ====== 侧栏 (收起:56px 图标 / 展开:240px 浮层) ====== */}
      <aside
        ref={sidebarRef}
        className={`${sidebarWidth} fixed top-[55px] left-0 bottom-0 z-40 bg-[#1A1C1E] overflow-hidden transition-all duration-200 ease-out ${
          sidebarExpanded ? 'shadow-2xl' : ''
        }`}
        onMouseEnter={() => { /* 保留给 hover 展开 */ }}
        onMouseLeave={() => { /* 保留给 hover 收起 */ }}
      >
        <nav className="py-3 h-full flex flex-col">
          {/* 版本号 */}
          <div className={`px-3 mb-2 text-center text-[10px] text-[#666666] ${sidebarExpanded ? '' : 'hidden'}`}>
            v2.0.0
          </div>

          <div className="flex-1 space-y-0.5 px-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const childActive = isChildActive(item);
              const expanded = expandedMenus.includes(item.label);

              return (
                <div key={item.label}>
                  {item.children ? (
                    /* ====== 可展开菜单 ====== */
                    <div>
                      <button
                        onClick={() => {
                          if (!sidebarExpanded) setSidebarExpanded(true);
                          toggleMenu(item.label);
                        }}
                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors group ${
                          childActive || expanded
                            ? 'text-white bg-white/10'
                            : 'text-[#999999] hover:text-white hover:bg-white/5'
                        }`}
                        title={!sidebarExpanded ? item.label : undefined}
                      >
                        <span className="shrink-0 flex items-center justify-center w-5 h-5">
                          {item.icon}
                        </span>
                        <span className={`flex-1 text-left text-[13px] font-medium truncate ${sidebarExpanded ? '' : 'hidden'}`}>
                          {item.label}
                        </span>
                        <span className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''} ${sidebarExpanded ? '' : 'hidden'}`}>
                          <Icons.ChevronDown />
                        </span>
                      </button>

                      {/* 子菜单 */}
                      {expanded && sidebarExpanded && (
                        <div className="mt-0.5 ml-2 space-y-0.5 overflow-hidden animate-slideDown">
                          {item.children.map((child) => {
                            const childActiveExact = pathname === child.href || pathname.startsWith(child.href + '/');
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setSidebarExpanded(false)}
                                className={`flex items-center gap-3 pl-3 pr-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                                  childActiveExact
                                    ? 'text-white bg-[#2D3BFF] font-medium'
                                    : 'text-[#888888] hover:text-white hover:bg-white/5'
                                }`}
                              >
                                {childActiveExact && (
                                  <span className="w-0.5 h-3 rounded-full bg-white shrink-0 -ml-0.5" />
                                )}
                                <span className={childActiveExact ? '' : 'ml-1'}>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ====== 叶子菜单 ====== */
                    <Link
                      href={item.href}
                      onClick={() => setSidebarExpanded(false)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? 'text-white bg-white/10 font-medium'
                          : 'text-[#999999] hover:text-white hover:bg-white/5'
                      }`}
                      title={!sidebarExpanded ? item.label : undefined}
                    >
                      <span className={`shrink-0 flex items-center justify-center w-5 h-5 ${active ? 'text-[#4C6FFF]' : ''}`}>
                        {item.icon}
                      </span>
                      <span className={`text-[13px] font-medium truncate ${sidebarExpanded ? '' : 'hidden'}`}>
                        {item.label}
                      </span>
                      {active && sidebarExpanded && (
                        <span className="ml-auto w-1 h-1 rounded-full bg-[#4C6FFF] shrink-0" />
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* 底部用户信息 */}
          <div className="px-2 mt-auto pt-3 border-t border-white/10">
            <div className={`flex items-center gap-3 px-2.5 py-2 rounded-md ${sidebarExpanded ? '' : 'justify-center'}`}>
              <div className="w-6 h-6 rounded-full bg-[#2D3BFF] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-white">{currentUser.name[0]}</span>
              </div>
              <span className={`text-[13px] text-[#999999] truncate ${sidebarExpanded ? '' : 'hidden'}`}>
                {currentUser.name}
              </span>
            </div>
          </div>
        </nav>
      </aside>

      {/* ====== 主内容区 ====== */}
      <main
        className={`pt-[55px] min-h-screen transition-all duration-200 ease-out ${
          sidebarExpanded ? 'ml-[240px]' : 'ml-[56px]'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
