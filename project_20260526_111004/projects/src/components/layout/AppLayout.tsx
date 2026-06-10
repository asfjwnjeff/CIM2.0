'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { NAV_ITEMS, type NavItem } from '@/lib/navigation';
import { GlobalSearchDialog } from './GlobalSearchDialog';

/* ====== Header 专用图标 ====== */

const HeaderIcons = {
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, setPermissionCodes, permissionCodes } = useApp();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showSidebarText, setShowSidebarText] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const textTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 初始化权限：管理员默认拥有全部权限 */
  useEffect(() => {
    async function initPermissions() {
      try {
        const permRes = await fetch('/api/permissions');
        if (permRes.ok) {
          const permData = await permRes.json();
          if (permData.success && permData.data) {
            const allPermissions = permData.data as Array<{ code: string; status: string }>;
            const codes = new Set(
              allPermissions.filter(p => p.status === 'active').map(p => p.code)
            );
            setPermissionCodes(codes);
          }
        }
      } catch {
        // 数据库未初始化时静默失败
      }
    }
    initPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** 根据权限过滤导航菜单（管理员 role=admin 时不过滤） */
  const filterNavByPermission = (items: NavItem[]): NavItem[] => {
    // 管理员显示全部菜单
    if (currentUser.role === 'admin') return items;
    return items
      .map(item => {
        if (item.children) {
          const filteredChildren = filterNavByPermission(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        if (!item.permissionCode) return item;
        return permissionCodes.has(item.permissionCode) ? item : null;
      })
      .filter(Boolean) as NavItem[];
  };

  const filteredNav = filterNavByPermission(NAV_ITEMS);

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
    filteredNav.forEach(item => {
      if (item.children?.some(child => pathname.startsWith(child.href)) && !expandedMenus.includes(item.label)) {
        setExpandedMenus(prev => [...prev, item.label]);
      }
    });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 延迟文本显示：展开时等宽度过渡完再显示，收起时立即隐藏 */
  useEffect(() => {
    if (sidebarExpanded) {
      textTimerRef.current = setTimeout(() => setShowSidebarText(true), 200);
    } else {
      setShowSidebarText(false);
      if (textTimerRef.current) clearTimeout(textTimerRef.current);
    }
    return () => {
      if (textTimerRef.current) clearTimeout(textTimerRef.current);
    };
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
            <HeaderIcons.Menu />
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
            onClick={() => setSearchOpen(true)}
          >
            <HeaderIcons.Search />
            <span>搜索...</span>
            <kbd className="ml-2 text-[10px] px-1 py-0.5 rounded bg-white border border-[#EBEBEB] text-[#999999]">
              ⌘K
            </kbd>
          </button>

          {/* 通知 */}
          <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors text-[#5A5A5A]">
            <HeaderIcons.Bell />
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
        className={`${sidebarWidth} fixed top-[55px] left-0 bottom-0 z-40 bg-[#1A1C1E] overflow-hidden transition-[width] duration-200 ease-out ${
          sidebarExpanded ? 'shadow-2xl' : ''
        }`}
        onMouseEnter={() => { /* 保留给 hover 展开 */ }}
        onMouseLeave={() => { /* 保留给 hover 收起 */ }}
      >
        <nav className="py-3 h-full flex flex-col">
          {/* 版本号 */}
          <div className={`px-3 mb-2 text-center text-[10px] text-[#666666] ${showSidebarText ? '' : 'hidden'}`}>
            v2.0.0
          </div>

          <div className="flex-1 space-y-0.5 px-2">
            {filteredNav.map((item) => {
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
                        <span className={`shrink-0 flex items-center justify-center ${sidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'}`}>
                          {item.icon}
                        </span>
                        <span className={`flex-1 text-left text-[14px] font-medium truncate ${showSidebarText ? '' : 'hidden'}`}>
                          {item.label}
                        </span>
                        <span className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''} ${showSidebarText ? '' : 'hidden'}`}>
                          <HeaderIcons.ChevronDown />
                        </span>
                      </button>

                      {/* 子菜单 */}
                      {expanded && showSidebarText && (
                        <div className="mt-0.5 ml-2 space-y-0.5 overflow-hidden animate-slideDown">
                          {item.children.map((child) => {
                            const childActiveExact = pathname === child.href || pathname.startsWith(child.href + '/');
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-3 pl-3 pr-2.5 py-1.5 rounded-md text-[14px] transition-colors ${
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
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? 'text-white bg-white/10 font-medium'
                          : 'text-[#999999] hover:text-white hover:bg-white/5'
                      }`}
                      title={!sidebarExpanded ? item.label : undefined}
                    >
                      <span className={`shrink-0 flex items-center justify-center ${sidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'} ${active ? 'text-[#4C6FFF]' : ''}`}>
                        {item.icon}
                      </span>
                      <span className={`text-[14px] font-medium truncate ${showSidebarText ? '' : 'hidden'}`}>
                        {item.label}
                      </span>
                      {active && showSidebarText && (
                        <span className="ml-auto w-1 h-1 rounded-full bg-[#4C6FFF] shrink-0" />
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* 侧栏收起按钮 — 仅展开时显示 */}
          {sidebarExpanded && (
            <div className="px-2 mb-1">
              <button
                onClick={() => setSidebarExpanded(false)}
                className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-md text-[#666666] hover:text-white hover:bg-white/5 transition-colors text-xs"
                aria-label="收起侧栏"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                <span className="text-[12px]">收起菜单</span>
              </button>
            </div>
          )}

          {/* 底部用户信息 */}
          <div className="px-2 mt-auto pt-3 border-t border-white/10">
            <div className={`flex items-center gap-3 px-2.5 py-2 rounded-md ${sidebarExpanded ? '' : 'justify-center'}`}>
              <div className="w-6 h-6 rounded-full bg-[#2D3BFF] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-white">{currentUser.name[0]}</span>
              </div>
              <span className={`text-[14px] text-[#999999] truncate ${showSidebarText ? '' : 'hidden'}`}>
                {currentUser.name}
              </span>
            </div>
          </div>
        </nav>
      </aside>

      {/* ====== 主内容区 ====== */}
      <main
        className={`pt-[87px] px-8 min-h-screen transition-[margin-left] duration-200 ease-out ${
          sidebarExpanded ? 'ml-[256px]' : 'ml-[72px]'
        }`}
      >
        {children}
      </main>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
