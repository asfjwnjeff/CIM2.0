'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';

// ==================== 统计卡片 ====================

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { direction: 'up' | 'down' | 'flat'; text: string };
  icon: React.ReactNode;
  href?: string;
}

function StatCard({ label, value, trend, icon, href }: StatCardProps) {
  const trendColor = trend?.direction === 'up' ? 'text-[#0D8A5E]' : trend?.direction === 'down' ? 'text-[#D63031]' : 'text-[#999999]';

  const content = (
    <div className="group bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#2D3BFF] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[12px] text-[#5A5A5A] font-medium">{label}</p>
          <p className="text-[36px] font-bold text-[#0A0A0A] tracking-tight">
            {value}
          </p>
        </div>
        <div className="w-12 h-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      {trend && (
        <p className={`text-[12px] mt-3 font-medium ${trendColor}`}>
          {trend.direction === 'up' && '↑ '}
          {trend.direction === 'down' && '↓ '}
          {trend.text}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// ==================== 待办卡片 ====================

function PendingCard({ label, count, href, color }: { label: string; count: number; href: string; color: string }) {
  const bgMap: Record<string, string> = {
    warning: 'bg-[#FFF4E8] border-[#FDE0B8]',
    primary: 'bg-[#E8EBFF] border-[#C8CEFF]',
    error: 'bg-[#FFEBEE] border-[#FFCDD2]',
  };
  const textMap: Record<string, string> = {
    warning: 'text-[#E8850C]',
    primary: 'text-[#2D3BFF]',
    error: 'text-[#D63031]',
  };
  const badgeBg: Record<string, string> = {
    warning: 'bg-[#E8850C]',
    primary: 'bg-[#2D3BFF]',
    error: 'bg-[#D63031]',
  };

  return (
    <Link
      href={href}
      className={`flex items-center justify-between p-4 rounded-xl border ${bgMap[color] || bgMap.primary} hover:shadow-md transition-all hover:-translate-y-0.5`}
    >
      <span className={`text-sm font-medium ${textMap[color] || textMap.primary}`}>{label}</span>
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ${badgeBg[color] || badgeBg.primary}`}>
        {count}
      </span>
    </Link>
  );
}

// ==================== SVG 图标 ====================

const Icons = {
  Users: () => (
    <svg className="w-6 h-6 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-6 h-6 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  StickyNote: () => (
    <svg className="w-6 h-6 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-6 h-6 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

// ==================== 主页面 ====================

const STAGE_ORDER = ['demand_confirmation', 'requirements_confirmation', 'solution_quotation', 'business_negotiation', 'following_up', 'following'];
const STAGE_LABELS: Record<string, string> = {
  demand_confirmation: '需求确认',
  requirements_confirmation: '方案报价',
  solution_quotation: '商务谈判',
  business_negotiation: '跟进中',
  following_up: '跟进中',
  following: '跟进中',
};

export default function DashboardPage() {
  const { customers, billingEntities, billingRules, operationLogs, opportunities, followUps, riskApprovals, contracts } = useApp();

  // 统计数据
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalCustomers = customers.length;
  const activeOpportunities = opportunities.filter(o => !['won', 'lost'].includes(o.stage)).length;
  const pendingApprovals = riskApprovals.filter(a => a.status === 'pending').length;
  const totalFollowUps = followUps.length;
  const activeEntities = billingEntities.filter(e => e.status === 'active').length;

  // 销售漏斗数据：按 stage 分组
  const funnelData = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(o => {
      const stage = o.stage || o.salesStage;
      if (stage) {
        counts[stage] = (counts[stage] || 0) + 1;
      }
    });
    return STAGE_ORDER
      .filter(s => counts[s] !== undefined || s === 'demand_confirmation')
      .map(s => ({
        name: STAGE_LABELS[s] || s,
        count: counts[s] || 0,
      }));
  }, [opportunities]);

  // 客户增长趋势：近12个月
  const trendData = useMemo(() => {
    const now = new Date();
    const months: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${String(d.getMonth() + 1).padStart(2, '0')}月`;
      months.push({ month: label, count: 0 });
    }
    customers.forEach(c => {
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const entry = months.find(m => {
          const monthNum = parseInt(m.month);
          const year = d.getFullYear();
          const targetKey = `${year}-${String(monthNum).padStart(2, '0')}`;
          return targetKey === key;
        });
        if (entry) entry.count++;
      }
    });
    return months;
  }, [customers]);

  // 待办事项
  const today = new Date().toISOString().slice(0, 10);
  const todayFollowUps = followUps.filter(f => (f.nextFollowUpDate || f.followUpDate || f.date)?.slice(0, 10) === today).length;
  const expiringContracts = contracts.filter(c => {
    if (!c.endDate) return false;
    const end = new Date(c.endDate);
    const days = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 30;
  }).length;

  const recentLogs = operationLogs.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">首页概览</h1>
        <p className="text-[13px] text-[#5A5A5A] mt-1">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      {/* 统计卡片 — 5 列 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="客户总数"
          value={totalCustomers}
          trend={{ direction: 'up', text: `活跃 ${activeCustomers} 家` }}
          icon={<Icons.Users />}
          href="/customers"
        />
        <StatCard
          label="活跃商机"
          value={activeOpportunities}
          trend={{ direction: totalFollowUps > 5 ? 'up' : 'flat', text: `${totalFollowUps} 条跟进记录` }}
          icon={<Icons.Briefcase />}
          href="/opportunities"
        />
        <StatCard
          label="待审批"
          value={pendingApprovals}
          trend={{ direction: pendingApprovals > 0 ? 'up' : 'flat', text: pendingApprovals > 0 ? '需要处理' : '暂无待办' }}
          icon={<Icons.Shield />}
          href="/approvals"
        />
        <StatCard
          label="跟进记录"
          value={totalFollowUps}
          trend={{ direction: 'up', text: `今日 ${todayFollowUps} 条待跟进` }}
          icon={<Icons.StickyNote />}
          href="/followup"
        />
        <StatCard
          label="规则匹配率"
          value="95.8%"
          trend={{ direction: 'flat', text: '本月数据' }}
          icon={<Icons.TrendUp />}
        />
      </div>

      {/* 图表区 — 2 列 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 销售漏斗 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
          <h2 className="text-[15px] font-semibold text-[#0A0A0A] mb-4">销售漏斗</h2>
          {funnelData.length === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-[#999999] text-sm">暂无商机数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ReBarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#999999' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#5A5A5A' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #EBEBEB', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: 13 }}
                  formatter={(value: number) => [`${value} 个`, '商机数']}
                />
                <Bar dataKey="count" fill="#2D3BFF" radius={[0, 4, 4, 0]} barSize={20} />
              </ReBarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 客户增长趋势 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
          <h2 className="text-[15px] font-semibold text-[#0A0A0A] mb-4">客户增长趋势</h2>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={trendData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D3BFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2D3BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999999' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#999999' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #EBEBEB', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: 13 }}
                formatter={(value: number) => [`${value} 家`, '新增客户']}
              />
              <Area type="monotone" dataKey="count" fill="url(#colorCount)" stroke="none" />
              <Line type="monotone" dataKey="count" stroke="#2D3BFF" strokeWidth={2} dot={{ r: 2, fill: '#2D3BFF' }} activeDot={{ r: 4, fill: '#2D3BFF' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 待处理事项 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
        <h2 className="text-[15px] font-semibold text-[#0A0A0A] mb-4">待处理事项</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PendingCard label="待审批风控" count={pendingApprovals} href="/approvals" color="warning" />
          <PendingCard label="今日待跟进" count={todayFollowUps} href="/followup" color="primary" />
          <PendingCard label="即将到期合同" count={expiringContracts} href="/contracts" color="error" />
        </div>
      </div>

      {/* 操作日志 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EBEBEB] bg-[#FAFAFA]">
          <h2 className="text-[15px] font-semibold text-[#0A0A0A] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2D3BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            最近操作日志
          </h2>
        </div>
        <div className="divide-y divide-[#EBEBEB]">
          {recentLogs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-14 h-14 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[#999999] text-sm">暂无操作日志</p>
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-3 hover:bg-[#F5F5F5] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#0A0A0A]">{log.action}</span>
                      <span className="text-[#D5D5D5]">·</span>
                      <span className="text-[13px] text-[#5A5A5A] truncate">{log.target}</span>
                    </div>
                    {log.details && (
                      <p className="text-[12px] text-[#999999] mt-0.5 truncate">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-[12px] text-[#5A5A5A]">{log.operator}</p>
                    <p className="text-[11px] text-[#999999] mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
