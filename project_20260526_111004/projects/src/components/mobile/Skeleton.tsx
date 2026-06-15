'use client';

import React from 'react';

/** 骨架屏卡片 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#EBEBEB] px-4 py-3.5 animate-pulse ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-1 h-12 rounded-full bg-[#EBEBEB]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#EBEBEB] rounded w-3/5" />
          <div className="h-3 bg-[#EBEBEB] rounded w-2/5" />
        </div>
        <div className="h-6 bg-[#EBEBEB] rounded-full w-14" />
      </div>
    </div>
  );
}

/** 骨架屏列表（多个卡片） */
export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** 骨架屏详情页 */
export function SkeletonDetail({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-lg bg-[#EBEBEB]" />
        <div className="space-y-1.5">
          <div className="h-5 bg-[#EBEBEB] rounded w-24" />
          <div className="h-3.5 bg-[#EBEBEB] rounded w-32" />
        </div>
      </div>

      {/* 信息卡片 */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 space-y-3 animate-pulse">
        <div className="h-4 bg-[#EBEBEB] rounded w-20" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3.5 bg-[#EBEBEB] rounded w-16" />
            <div className="h-3.5 bg-[#EBEBEB] rounded w-28" />
          </div>
        ))}
      </div>

      {/* 流程卡片 */}
      <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 space-y-3 animate-pulse">
        <div className="h-4 bg-[#EBEBEB] rounded w-20" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#EBEBEB]" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-[#EBEBEB] rounded w-32" />
              <div className="h-3 bg-[#EBEBEB] rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
