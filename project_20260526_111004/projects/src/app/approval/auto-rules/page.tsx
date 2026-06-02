'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';

const serviceProductColors: Record<string, string> = {
  '货代': 'bg-[#E8F4FF] text-[#2D3BFF]',
  '关务': 'bg-[#E6FFFA] text-[#0D9488]',
  '仓储': 'bg-[#FFF7ED] text-[#EA580C]',
  '运输': 'bg-[#FEFCE8] text-[#CA8A04]',
  '进出口': 'bg-[#F0FDF4] text-[#16A34A]',
  '维修': 'bg-[#FEF2F2] text-[#DC2626]',
  '合同物流': 'bg-[#E8F4FF] text-[#2D3BFF]',
  '其他': 'bg-[#F5F5F5] text-[#5A5A5A]',
};

export default function AutoRulesPage() {
  const { autoApprovalRules, deleteAutoApprovalRule } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = autoApprovalRules.filter((r: any) => {
    const name = r.name || '';
    const remark = r.remark || '';
    if (searchTerm && !name.includes(searchTerm) && !remark.includes(searchTerm)) return false;
    if (filterProduct && r.serviceProduct !== filterProduct && r.serviceProduct !== '全部') return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <div className="flex items-center text-sm text-[#999999] mb-4">
            <Link href="/" className="hover:text-[#2D3BFF]">首页</Link>
            <span className="mx-2">/</span>
            <span className="text-[#0A0A0A]">自动审批规则</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">自动审批规则</h1>
              <p className="text-[#5A5A5A] mt-1">配置自动审批规则，根据条件自动处理审批流程</p>
            </div>
            <Link
              href="/approval/auto-rules/new"
              className="px-5 py-2.5 text-sm text-white rounded-xl bg-[#2D3BFF] hover:bg-[#4338CA] transition-colors"
            >
              + 新增规则
            </Link>
          </div>
        </div>

        {/* 筛选区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索规则名称、审批点..."
              className="flex-1 px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 placeholder:text-[#999999]"
            />
            <select
              value={filterProduct}
              onChange={e => setFilterProduct(e.target.value)}
              className="px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
            >
              <option value="">全部产品</option>
              {['货代', '关务', '仓储', '运输', '进出口', '维修', '合同物流', '其他'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
            >
              <option value="">全部状态</option>
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
        </div>

        {/* 规则卡片列表 */}
        <div className="space-y-4">
          {filtered.map(rule => {
            const conditions = (rule as any).conditions as any[] || [];
            const actions = (rule as any).actions as any[] || [];
            const conditionsSummary = conditions.map((c: any) => `${c.field} ${c.operator === 'less_than' ? '<' : c.operator === 'greater_than' ? '>' : c.operator === 'equals' ? '=' : c.operator} ${c.value}`).join(` ${rule.conditionLogic === 'OR' ? '或' : '且'} `);
            const actionsSummary = actions.map((a: any) => a.description || a.message || a.type).join('; ');
            const updatedAt = (rule as any).updatedAt || (rule as any).createdAt || '';
            return (
            <div key={rule.id} className="relative group">
            <Link
              href={`/approval/auto-rules/${rule.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 hover:shadow-md hover:border-[#2D3BFF]/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-base font-semibold text-[#0A0A0A]">{rule.name}</h3>
                    <span className={`px-2.5 py-1 text-sm rounded-lg ${serviceProductColors[rule.serviceProduct || ''] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                      {rule.serviceProduct || '全部'}
                    </span>
                    <span className={`px-2.5 py-1 text-sm rounded-lg ${rule.status === 'active' ? 'bg-[#2D3BFF] text-white' : 'bg-[#999999] text-white'}`}>
                      {rule.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </div>
                  <div className="text-sm text-[#5A5A5A] mb-3">
                    <span className="font-medium text-[#0A0A0A]">条件逻辑：</span>
                    <span className="text-[#EA580C] font-medium">{rule.conditionLogic === 'OR' ? '任一满足' : '全部满足'}</span>
                  </div>
                  <div className="p-3 bg-[#F5F5F5] rounded-xl mb-3">
                    <div className="text-sm mb-1">
                      <span className="text-[#999999]">触发条件：</span>
                      <span className="text-[#0A0A0A]">{conditionsSummary || (rule as any).remark || '无'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[#999999]">执行动作：</span>
                      <span className="text-[#0A0A0A]">{actionsSummary || '无'}</span>
                    </div>
                  </div>
                  <div className="text-sm text-[#999999]">
                    <span>备注：{(rule as any).remark || (rule as any).failureMessage || '-'}</span>
                    <span className="mx-3 text-[#E5E7EB]">|</span>
                    <span>更新于 {updatedAt?.slice(0, 10) || '-'}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#999999] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm(`确定要删除规则「${rule.name}」吗？`)) deleteAutoApprovalRule(rule.id); }}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 text-xs text-[#D63031] hover:bg-[#FFEBEE] rounded-lg"
            >
              删除
            </button>
            </div>
          );})}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#999999]">暂无匹配的规则</div>
          )}
        </div>
      </div>
  );
}
