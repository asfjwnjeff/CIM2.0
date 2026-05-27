import { cn } from "@/lib/utils"
import React from 'react';

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer bg-gradient-to-r from-[#EBEBEB] via-[#F5F5F5] to-[#EBEBEB] bg-[length:200%_100%] rounded-md",
        className
      )}
      {...props}
    />
  )
}

/** 文本行骨架 */
function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/** 卡片骨架 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-[#EBEBEB] p-5", className)}>
      <Skeleton className="h-5 w-1/3 mb-4" />
      <SkeletonText lines={3} className="mb-3" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/** 表格行骨架 */
function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 h-[44px] border-b border-[#EBEBEB]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === 0 ? 'w-8' : 'flex-1'}`} />
      ))}
    </div>
  );
}

/** 表格骨架 */
function SkeletonTable({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
      <div className="flex items-center gap-4 px-4 h-[36px] bg-[#FAFAFA] border-b border-[#EBEBEB]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}

/** 表单骨架 */
function SkeletonForm({ fields = 6 }: { fields?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-20 mb-1.5" />
          <Skeleton className="h-[38px] w-full" />
        </div>
      ))}
    </div>
  );
}

/** 详情页骨架 */
function SkeletonDetail() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div>
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex gap-0 border-b border-[#EBEBEB]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 mx-4" />
        ))}
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTableRow, SkeletonTable, SkeletonForm, SkeletonDetail }
