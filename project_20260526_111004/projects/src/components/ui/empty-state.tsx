import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** 操作按钮文字 */
  actionLabel?: string;
  /** 操作按钮链接 */
  actionHref?: string;
  /** 操作按钮点击回调(如果提供则渲染button而非Link) */
  onAction?: () => void;
  className?: string;
}

/**
 * 空状态组件
 * 三种场景: 列表空 / 搜索无结果 / 详情无数据
 */

/** 列表空状态: 用于列表页无数据时 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
      {icon ? (
        <div className="mb-5 text-[#D5D5D5]">{icon}</div>
      ) : (
        <div className="mb-5 w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-md font-semibold text-[#0A0A0A] mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-[#999999] max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center h-[38px] px-5 bg-[#2D3BFF] text-white text-sm font-semibold rounded-lg hover:bg-[#4338CA] transition-colors no-underline"
          >
            {actionLabel}
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center h-[38px] px-5 bg-[#2D3BFF] text-white text-sm font-semibold rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            {actionLabel}
          </button>
        ) : null
      )}
    </div>
  );
}

/** 搜索无结果状态 */
export function SearchEmptyState({
  searchQuery = '',
  onClear,
  className = '',
}: {
  searchQuery?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="mb-4 w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center">
        <svg className="w-7 h-7 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-md font-semibold text-[#0A0A0A] mb-1">
        没有找到匹配 &ldquo;{searchQuery}&rdquo; 的结果
      </h3>
      <p className="text-sm text-[#999999] mb-5">尝试调整搜索条件或筛选器</p>
      {onClear && (
        <button
          onClick={onClear}
          className="inline-flex items-center h-[38px] px-4 border border-[#D5D5D5] text-[#0A0A0A] text-sm font-medium rounded-lg hover:bg-[#F5F5F5] transition-colors"
        >
          清除筛选条件
        </button>
      )}
    </div>
  );
}

/** 空值占位: 用于详情页单个字段为空时 */
export function EmptyValue({ className = '' }: { className?: string }) {
  return <span className={`text-[#999999] font-light ${className}`}>&mdash;</span>;
}
