'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Quote, QuoteStatus } from '@/lib/types';

export default function QuotesPage() {
  const router = useRouter();
  const { salesQuotes, customers } = useApp();
  
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredQuotes = useMemo(() => {
    return salesQuotes.filter((quote) => {
      const matchesSearch = 
        (quote.quoteNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (quote.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (quote.customerName || '').toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      
      const quoteDate = new Date(quote.createdAt);
      const matchesStart = !dateRange.start || quoteDate >= new Date(dateRange.start);
      const matchesEnd = !dateRange.end || quoteDate <= new Date(dateRange.end);
      
      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [salesQuotes, search, statusFilter, dateRange]);

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case 'pending': return 'bg-[#FFF5E5] text-[#FF6B00]';
      case 'pending_review': return 'bg-[#FFF5E5] text-[#FF6B00]';
      case 'accepted': return 'bg-[#E5F9F0] text-[#00A854]';
      case 'rejected': return 'bg-[#FCE8E8] text-[#D63031]';
      case 'sent': return 'bg-[#E5F2FF] text-[#2D3BFF]';
      case 'transferred': return 'bg-[#EBEBEB] text-[#5A5A5A]';
      default: return 'bg-[#EBEBEB] text-[#5A5A5A]';
    }
  };

  const getStatusText = (status: QuoteStatus) => {
    switch (status) {
      case 'pending': return '草稿';
      case 'pending_review': return '待审批';
      case 'accepted': return '已接受';
      case 'rejected': return '已拒绝';
      case 'sent': return '已发送';
      case 'transferred': return '已转商机';
      default: return status;
    }
  };

  const formatCurrency = (amount: number | undefined, currency?: string) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency || 'CNY',
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">售前报价</h1>
            <p className="text-[#5A5A5A] mt-1">管理报价单，跟踪报价状态</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/quotes/templates')}
              className="bg-[#F5F5F5] text-[#0A0A0A] border-none px-5 py-2.5 rounded-lg font-medium hover:bg-[#EBEBEB] transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              模板管理
            </button>
            <button
              onClick={() => router.push('/quotes/new')}
              className="bg-[#2D3BFF] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建报价
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <svg className="w-5 h-5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索报价单号、标题或客户..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D5D5D5] rounded-lg focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#D5D5D5] rounded-lg focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            >
              <option value="all">全部状态</option>
              <option value="pending">草稿</option>
              <option value="pending_review">待审批</option>
              <option value="sent">已发送</option>
              <option value="accepted">已接受</option>
              <option value="rejected">已拒绝</option>
              <option value="transferred">已转商机</option>
            </select>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2.5 border border-[#D5D5D5] rounded-lg focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            />
            <span className="text-[#5A5A5A]">至</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2.5 border border-[#D5D5D5] rounded-lg focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            />
            <div className="flex items-center gap-2 ml-auto bg-[#F5F5F5] rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'cards' ? 'bg-white text-[#2D3BFF] shadow-sm' : 'text-[#5A5A5A] hover:text-[#2D3BFF]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table' ? 'bg-white text-[#2D3BFF] shadow-sm' : 'text-[#5A5A5A] hover:text-[#2D3BFF]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                onClick={() => router.push(`/quotes/${quote.id}`)}
                className="bg-white rounded-xl border border-[#EBEBEB] p-5 hover:shadow-md hover:border-[#2D3BFF]/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-[#5A5A5A] font-medium">报价单号</div>
                    <div className="text-lg font-semibold text-[#0A0A0A]">{quote.quoteNumber}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                    {getStatusText(quote.status)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A0A0A] mb-1">{quote.title}</h3>
                    <p className="text-[#5A5A5A]">{quote.customerName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#EBEBEB]">
                    <div>
                      <div className="text-sm text-[#999999]">总金额</div>
                      <div className="text-xl font-bold text-[#2D3BFF]">
                        {formatCurrency(quote.totalAmount, quote.currency)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#999999]">创建日期</div>
                      <div className="text-[#0A0A0A]">{formatDate(quote.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-[#EBEBEB]">
                    <div className="text-sm text-[#999999] mb-2">有效期</div>
                    <div className="text-[#0A0A0A]">{formatDateRange(quote.validFrom, quote.validTo)}</div>
                  </div>
                  
                  {quote.ownerName && (
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-6 h-6 rounded-full bg-[#2D3BFF] flex items-center justify-center text-white text-xs font-medium">
                        {quote.ownerName?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-[#5A5A5A]">{quote.ownerName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredQuotes.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">暂无报价单</h3>
                <p className="text-[#5A5A5A] mb-4">
                  {search || statusFilter !== 'all' || dateRange.start || dateRange.end 
                    ? '没有找到符合条件的报价单，请尝试调整筛选条件' 
                    : '开始创建您的第一个报价单吧'}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/quotes/new');
                  }}
                  className="bg-[#2D3BFF] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all active:scale-[0.98] inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新建报价
                </button>
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F5F5] border-b border-[#EBEBEB]">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0A0A0A]">报价单号</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0A0A0A]">标题</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0A0A0A]">客户</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0A0A0A]">总金额</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0A0A0A]">状态</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0A0A0A]">创建日期</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#0A0A0A]">负责人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {filteredQuotes.map((quote) => (
                    <tr
                      key={quote.id}
                      onClick={() => router.push(`/quotes/${quote.id}`)}
                      className="hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-[#2D3BFF]">{quote.quoteNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#0A0A0A]">{quote.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#0A0A0A]">{quote.customerName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#0A0A0A]">{formatCurrency(quote.totalAmount, quote.currency)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusText(quote.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#5A5A5A]">{formatDate(quote.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {quote.ownerName && (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#2D3BFF] flex items-center justify-center text-white text-xs font-medium">
                              {quote.ownerName?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-[#0A0A0A]">{quote.ownerName}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredQuotes.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">暂无报价单</h3>
                  <p className="text-[#5A5A5A] mb-4">
                    {search || statusFilter !== 'all' || dateRange.start || dateRange.end 
                      ? '没有找到符合条件的报价单，请尝试调整筛选条件' 
                      : '开始创建您的第一个报价单吧'}
                  </p>
                  <button
                    onClick={() => router.push('/quotes/new')}
                    className="bg-[#2D3BFF] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all active:scale-[0.98] inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    新建报价
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
