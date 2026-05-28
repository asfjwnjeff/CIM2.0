'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MockRule {
  id: string;
  approvalPoint: string;
  name: string;
  serviceProduct: string;
  status: 'active' | 'inactive';
  remark: string;
  conditionLogic: 'AND' | 'OR';
  conditionsSummary: string;
  actionsSummary: string;
  implementationMethod: string;
  updatedAt: string;
}

const mockRules: MockRule[] = [
  {
    id: '1',
    approvalPoint: '业务量',
    name: '低业务量提醒评估',
    serviceProduct: '货代',
    status: 'active',
    remark: '月订单数≤5或月开票额<5000元，提醒评估业务必要性',
    conditionLogic: 'OR',
    conditionsSummary: '月均订单数 ≤ 5 或 月均开票额 < 5000元',
    actionsSummary: '显示提示：业务量较低，请评估业务必要性',
    implementationMethod: '字段条件判断，【月均订单数】，【月均开票额】',
    updatedAt: '2024-12-15',
  },
  {
    id: '2',
    approvalPoint: '实际落地承运商安排可行性',
    name: '运输供应商确认校验',
    serviceProduct: '运输',
    status: 'active',
    remark: '主要运输供应商是否已确定，校验当前已确认的合作供应商',
    conditionLogic: 'AND',
    conditionsSummary: '合作供应商 范围内 已确认供应商库',
    actionsSummary: '自动通过 + 显示提示：供应商已在确认范围内，自动通过',
    implementationMethod: '供应商库，范围内通过，其他人工审批',
    updatedAt: '2024-12-10',
  },
  {
    id: '3',
    approvalPoint: 'KPI时效考核要求',
    name: '运输及时率考核评估',
    serviceProduct: '运输',
    status: 'active',
    remark: '客户运输及时率≥99%需评估',
    conditionLogic: 'AND',
    conditionsSummary: '运输及时率 ≥ 99%',
    actionsSummary: '显示提示：客户运输及时率要求较高(≥99%)，请评估KPI可行性',
    implementationMethod: '字段条件判断，运输及时率',
    updatedAt: '2024-12-08',
  },
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = mockRules.filter(r => {
    if (searchTerm && !r.name.includes(searchTerm) && !r.approvalPoint.includes(searchTerm) && !r.remark.includes(searchTerm)) return false;
    if (filterProduct && r.serviceProduct !== filterProduct) return false;
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
          {filtered.map(rule => (
            <Link
              key={rule.id}
              href={`/approval/auto-rules/${rule.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 hover:shadow-md hover:border-[#2D3BFF]/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-base font-semibold text-[#0A0A0A]">{rule.name}</h3>
                    <span className={`px-2.5 py-1 text-sm rounded-lg ${serviceProductColors[rule.serviceProduct] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                      {rule.serviceProduct}
                    </span>
                    <span className={`px-2.5 py-1 text-sm rounded-lg ${rule.status === 'active' ? 'bg-[#2D3BFF] text-white' : 'bg-[#999999] text-white'}`}>
                      {rule.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </div>
                  <div className="text-sm text-[#5A5A5A] mb-3">
                    <span className="font-medium text-[#0A0A0A]">审批点：</span>{rule.approvalPoint}
                    <span className="mx-3 text-[#E5E7EB]">|</span>
                    <span className="font-medium text-[#0A0A0A]">条件逻辑：</span>
                    <span className="text-[#EA580C] font-medium">{rule.conditionLogic === 'AND' ? '全部满足' : '任一满足'}</span>
                  </div>
                  <div className="p-3 bg-[#F5F5F5] rounded-xl mb-3">
                    <div className="text-sm mb-1">
                      <span className="text-[#999999]">触发条件：</span>
                      <span className="text-[#0A0A0A]">{rule.conditionsSummary}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[#999999]">执行动作：</span>
                      <span className="text-[#0A0A0A]">{rule.actionsSummary}</span>
                    </div>
                  </div>
                  <div className="text-sm text-[#999999]">
                    <span>实现方式：{rule.implementationMethod}</span>
                    <span className="mx-3 text-[#E5E7EB]">|</span>
                    <span>更新于 {rule.updatedAt}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#999999] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#999999]">暂无匹配的规则</div>
          )}
        </div>
      </div>
  );
}
