'use client';

import React, { useCallback, useRef, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export default function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const threshold = 60;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0) return; // 仅在顶部时触发
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    touchCurrentY.current = e.touches[0].clientY;
    const distance = Math.max(0, touchCurrentY.current - touchStartY.current);
    setPullDistance(Math.min(distance * 0.5, 80)); // 阻尼效果
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉指示器 */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          height: pullDistance,
          opacity: pullDistance / threshold,
        }}
      >
        <div className="flex items-center gap-2 text-xs text-[#999999]">
          {refreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-[#2D3BFF] border-t-transparent rounded-full animate-spin" />
              刷新中...
            </>
          ) : pullDistance >= threshold ? (
            '释放刷新'
          ) : (
            '下拉刷新'
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
