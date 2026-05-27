'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';

export default function DashboardPage() {
  const { customers, billingEntities, billingRules, operationLogs } = useApp();

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const activeEntities = billingEntities.filter(e => e.status === 'active').length;
  const activeRules = billingRules.filter(r => r.status === 'active').length;
  const recentLogs = operationLogs.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#0A0A0A]">
          首页概览
        </h1>
        <p className="text-[13px] text-[#5A5A5A] mt-2">客户信息管理、账单拆分规则配置和产业链关系管理</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#2D3BFF] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[13px] text-[#5A5A5A]">已接入客户数</p>
              <p className="text-[40px] font-bold text-[#0A0A0A]">
                {activeCustomers}
              </p>
            </div>
            <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <Link href="/customers" className="text-sm text-[#2D3BFF] mt-4 inline-block font-medium hover:text-[#4338CA] transition-colors group-hover:translate-x-1 duration-200">
            查看全部 →
          </Link>
        </div>

        <div className="group bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#2D3BFF] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[13px] text-[#5A5A5A]">账单主体数</p>
              <p className="text-[40px] font-bold text-[#0A0A0A]">
                {activeEntities}
              </p>
            </div>
            <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <Link href="/rules" className="text-sm text-[#2D3BFF] mt-4 inline-block font-medium hover:text-[#4338CA] transition-colors group-hover:translate-x-1 duration-200">
            查看全部 →
          </Link>
        </div>

        <div className="group bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#2D3BFF] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[13px] text-[#5A5A5A]">已配置规则数</p>
              <p className="text-[40px] font-bold text-[#0A0A0A]">
                {activeRules}
              </p>
            </div>
            <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <Link href="/rules" className="text-sm text-[#2D3BFF] mt-4 inline-block font-medium hover:text-[#4338CA] transition-colors group-hover:translate-x-1 duration-200">
            查看全部 →
          </Link>
        </div>

        <div className="group bg-white rounded-2xl p-6 border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#2D3BFF] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[13px] text-[#5A5A5A]">规则匹配成功率</p>
              <p className="text-[40px] font-bold text-[#0A0A0A]">
                95.8%
              </p>
            </div>
            <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <span className="text-[13px] text-[#2D3BFF] mt-4 inline-block font-medium">
            本月数据
          </span>
        </div>
      </div>

      {/* 操作日志 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EBEBEB] bg-[#FAFAFA]">
          <h2 className="text-[16px] font-semibold text-[#0A0A0A] flex items-center">
            <svg className="w-5 h-5 mr-2 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            最近操作日志
          </h2>
        </div>
        <div className="divide-y divide-[#EBEBEB]">
          {recentLogs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-16 h-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[#999999]">暂无操作日志</p>
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3.5 border-b border-[#EBEBEB] hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[13px] font-semibold text-[#0A0A0A]">{log.action}</span>
                      <span className="text-[#EBEBEB]">•</span>
                      <span className="text-[13px] text-[#5A5A5A]">{log.target}</span>
                    </div>
                    {log.details && (
                      <p className="text-[13px] text-[#5A5A5A] mt-1">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-[13px] text-[#5A5A5A]">{log.operator}</p>
                    <p className="text-[11px] text-[#999999] mt-1">{log.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/rules"
          className="group bg-[#F5F5F5] rounded-2xl p-6 hover:bg-[#EBEBEB] transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0A0A0A]">账单主体规则管理</h3>
              <p className="text-[13px] text-[#5A5A5A] mt-1">配置和管理账单拆分规则</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-[#2D3BFF] group-hover:translate-x-2 transition-transform duration-300">
            <span className="text-[13px] font-medium">立即配置</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </Link>

        <Link
          href="/settings/fields"
          className="group bg-[#F5F5F5] rounded-2xl p-6 hover:bg-[#EBEBEB] transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0A0A0A]">字典管理</h3>
              <p className="text-[13px] text-[#5A5A5A] mt-1">配置拆分字段和可选值</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-[#2D3BFF] group-hover:translate-x-2 transition-transform duration-300">
            <span className="text-[13px] font-medium">立即配置</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </Link>

        <Link
          href="/customers"
          className="group bg-[#F5F5F5] rounded-2xl p-6 hover:bg-[#EBEBEB] transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0A0A0A]">客户管理</h3>
              <p className="text-[13px] text-[#5A5A5A] mt-1">管理客户信息和资料</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-[#2D3BFF] group-hover:translate-x-2 transition-transform duration-300">
            <span className="text-[13px] font-medium">立即管理</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
