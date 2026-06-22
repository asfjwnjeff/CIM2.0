'use client';

import React from 'react';
import BottomTabBar from '@/components/mobile/BottomTabBar';
import ThemeToggle from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page pb-[calc(56px+env(safe-area-inset-bottom,0px))]">
      {/* 移动端顶部状态栏 */}
      <header
        className="sticky top-0 z-40 bg-surface border-b border-light flex items-center justify-between px-4"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="w-8" />
        <div className="h-12 flex items-center">
          <span className="text-[15px] font-bold tracking-tight text-primary">
            CIM <span className="font-normal text-secondary">2.0</span>
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* 页面内容 */}
      <main className="px-4 py-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 0px))' }}>
        {children}
      </main>

      {/* 底部导航栏 */}
      <BottomTabBar />
      <Toaster position="top-center" />
    </div>
  );
}
