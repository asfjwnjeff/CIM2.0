'use client';

import { useState, useMemo, useCallback } from 'react';
import type { SentimentItem, SentimentFilters } from '@/lib/types';
import { DEMO_SENTIMENT_ITEMS, generateMoreSentimentItems } from '@/lib/sentiment-demo';

const PAGE_SIZE = 5;

export interface UseSentimentReturn {
  items: SentimentItem[];
  headline: SentimentItem | null;
  filters: SentimentFilters;
  setFilters: (f: Partial<SentimentFilters>) => void;
  hasMore: boolean;
  loadMore: () => void;
  getItemById: (id: string) => SentimentItem | undefined;
  isLoading: boolean;
}

export function useSentiment(_customerId: string): UseSentimentReturn {
  // TODO: 将来替换为真实 API 调用，customerId 用于查询指定客户的舆情数据
  const [filters, setFiltersState] = useState<SentimentFilters>({
    sourceType: 'all',
    impactAssessment: 'all',
    dateRange: null,
    search: '',
  });

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  // 所有数据（初始 5 条 demo + 模拟更多数据）
  const allItems = useMemo(() => {
    return [
      ...DEMO_SENTIMENT_ITEMS,
      ...generateMoreSentimentItems(6, 15),
    ];
  }, []);

  // 筛选
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    if (filters.sourceType !== 'all') {
      result = result.filter((item) => item.sourceType === filters.sourceType);
    }

    if (filters.impactAssessment !== 'all') {
      result = result.filter((item) => item.impactAssessment === filters.impactAssessment);
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = result.filter(
        (item) => item.publishDate >= start && item.publishDate <= end
      );
    }

    if (filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.summary.toLowerCase().includes(keyword) ||
          item.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
          item.source.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [allItems, filters]);

  // 按发布日期倒序排列
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }, [filteredItems]);

  // 头条：第一条
  const headline = useMemo(() => {
    return sortedItems.length > 0 ? sortedItems[0] : null;
  }, [sortedItems]);

  // 列表项（除去头条后的条目）
  const listItems = useMemo(() => {
    if (headline) {
      return sortedItems.slice(1);
    }
    return sortedItems;
  }, [sortedItems, headline]);

  // 当前可见的列表条目
  const visibleItems = useMemo(() => {
    return listItems.slice(0, visibleCount);
  }, [listItems, visibleCount]);

  const hasMore = visibleCount < listItems.length;

  const loadMore = useCallback(() => {
    setIsLoading(true);
    // 模拟加载延迟
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, listItems.length));
      setIsLoading(false);
    }, 500);
  }, [listItems.length]);

  const getItemById = useCallback(
    (id: string): SentimentItem | undefined => {
      return allItems.find((item) => item.id === id);
    },
    [allItems]
  );

  const setFilters = useCallback((partial: Partial<SentimentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setVisibleCount(PAGE_SIZE);
  }, []);

  return {
    items: visibleItems,
    headline,
    filters,
    setFilters,
    hasMore,
    loadMore,
    getItemById,
    isLoading,
  };
}
