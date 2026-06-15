'use client';

import React from 'react';
import BottomTabBar from '@/components/mobile/BottomTabBar';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-[calc(56px+env(safe-area-inset-bottom,0px))]">
      {/* 移动端顶部状态栏 */}
      <header
        className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB] flex items-center justify-center"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="h-12 flex items-center">
          <span className="text-[15px] font-bold tracking-tight text-[#0A0A0A]">
            CIM <span className="font-normal text-[#5A5A5A]">2.0</span>
          </span>
        </div>
      </header>

      {/* 页面内容 */}
      <main className="px-4 py-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 0px))' }}>
        {children}
      </main>

      {/* 底部导航栏 */}
      <BottomTabBar />
    </div>
  );
}
