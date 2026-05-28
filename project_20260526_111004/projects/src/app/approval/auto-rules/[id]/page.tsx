'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const serviceProductOptions = ['货代', '关务', '仓储', '运输', '进出口', '维修', '合同物流', '其他'];

const fieldOptions = [
  '是否贸易代理', '月开票金额', '月均订单数', '月均开票额', '运输及时率', '客户等级', '信用额度',
  '合同金额', '服务产品', '签约主体', '结算主体', '合作供应商',
];

const operatorOptions: Record<string, string[]> = {
  '是否贸易代理': ['等于', '不等于'],
  '月开票金额': ['等于', '不等于', '大于', '小于', '大于等于', '小于等于'],
  '月均订单数': ['等于', '不等于', '大于', '小于', '大于等于', '小于等于'],
  '月均开票额': ['等于', '不等于', '大于', '小于', '大于等于', '小于等于'],
  '运输及时率': ['等于', '不等于', '大于', '小于', '大于等于', '小于等于'],
  '客户等级': ['等于', '不等于', '包含', '不包含'],
  '信用额度': ['等于', '不等于', '大于', '小于'],
  '合同金额': ['等于', '不等于', '大于', '小于', '大于等于', '小于等于'],
  '服务产品': ['等于', '不等于', '包含', '不包含'],
  '签约主体': ['等于', '不等于', '包含'],
  '结算主体': ['等于', '不等于', '包含'],
  '合作供应商': ['等于', '不等于', '包含', '不包含', '范围内', '范围外'],
};

const actionTypes = [
  { value: 'auto_approve', label: '自动通过', description: '满足条件时自动通过审批' },
  { value: 'auto_reject', label: '自动拒绝', description: '满足条件时自动拒绝审批' },
  { value: 'add_approver', label: '添加审批人', description: '自动在审批流程中添加指定审批人' },
  { value: 'skip_node', label: '跳过节点', description: '跳过指定的审批节点' },
  { value: 'show_message', label: '显示提示', description: '在审批页面显示提示信息' },
];

interface Condition { field: string; operator: string; value: string; }
interface Action { type: string; target: string; message: string; }

interface MockRule {
  id: string;
  approvalPoint: string;
  name: string;
  serviceProduct: string;
  status: 'active' | 'inactive';
  remark: string;
  conditionLogic: 'AND' | 'OR';
  conditions: Condition[];
  actions: Action[];
  implementationMethod: string;
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
    conditions: [
      { field: '月均订单数', operator: '小于等于', value: '5' },
      { field: '月均开票额', operator: '小于', value: '5000元' },
    ],
    actions: [
      { type: 'show_message', target: '', message: '业务量较低，请评估业务必要性' },
    ],
    implementationMethod: '字段条件判断，【月均订单数】，【月均开票额】',
  },
  {
    id: '2',
    approvalPoint: '实际落地承运商安排可行性',
    name: '运输供应商确认校验',
    serviceProduct: '运输',
    status: 'active',
    remark: '主要运输供应商是否已确定，校验当前已确认的合作供应商',
    conditionLogic: 'AND',
    conditions: [
      { field: '合作供应商', operator: '范围内', value: '已确认供应商库' },
    ],
    actions: [
      { type: 'auto_approve', target: '', message: '供应商已在合作范围内' },
      { type: 'show_message', target: '', message: '供应商已在确认范围内，自动通过' },
    ],
    implementationMethod: '供应商库，范围内通过，其他人工审批',
  },
  {
    id: '3',
    approvalPoint: 'KPI时效考核要求',
    name: '运输及时率考核评估',
    serviceProduct: '运输',
    status: 'active',
    remark: '客户运输及时率≥99%需评估',
    conditionLogic: 'AND',
    conditions: [
      { field: '运输及时率', operator: '大于等于', value: '99%' },
    ],
    actions: [
      { type: 'show_message', target: '', message: '客户运输及时率要求较高(≥99%)，请评估KPI可行性' },
    ],
    implementationMethod: '字段条件判断，运输及时率',
  },
];

export default function AutoRuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const rule = mockRules.find(r => r.id === id) || mockRules[0];

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部导航 */}
        <div>
          <div className="flex items-center text-sm text-[#999999] mb-4">
            <Link href="/" className="hover:text-[#2D3BFF]">首页</Link>
            <span className="mx-2">/</span>
            <Link href="/approval/auto-rules" className="hover:text-[#2D3BFF]">自动审批规则</Link>
            <span className="mx-2">/</span>
            <span className="text-[#0A0A0A]">查看规则</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">查看自动审批规则</h1>
              <p className="text-[#5A5A5A] mt-1">查看自动审批规则的详细配置信息</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/approval/auto-rules')}
                className="px-5 py-2.5 text-sm text-[#5A5A5A] border border-[#E5E7EB] rounded-xl hover:bg-[#F5F5F5] transition-colors"
              >
                返回列表
              </button>
              <button
                onClick={() => router.push(`/approval/auto-rules/${id}/edit`)}
                className="px-5 py-2.5 text-sm text-white rounded-xl bg-[#2D3BFF] hover:bg-[#4338CA] transition-colors"
              >
                编辑规则
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧 */}
          <div className="col-span-7 space-y-5">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">基本信息</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">审批点</label>
                  <div className="px-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#0A0A0A]">{rule.approvalPoint}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">规则名称</label>
                  <div className="px-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#0A0A0A]">{rule.name}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">服务产品</label>
                <div className="px-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#0A0A0A]">{rule.serviceProduct}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">规则说明</label>
                <div className="px-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#0A0A0A] min-h-[60px]">{rule.remark}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-[#5A5A5A]">状态</label>
                <span className={`px-3 py-1 text-sm rounded-lg ${rule.status === 'active' ? 'bg-[#2D3BFF] text-white' : 'bg-[#999999] text-white'}`}>
                  {rule.status === 'active' ? '启用' : '禁用'}
                </span>
              </div>
            </div>

            {/* 触发条件 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
                <h3 className="text-sm font-semibold text-[#0A0A0A]">触发条件</h3>
                <span className="text-sm text-[#5A5A5A]">条件逻辑：<span className="text-[#EA580C] font-medium">{rule.conditionLogic === 'AND' ? '全部满足 (AND)' : '任一满足 (OR)'}</span></span>
              </div>
              <div className="space-y-3">
                {rule.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {index > 0 && (
                      <span className="text-sm font-medium text-[#EA580C] px-2 py-1 bg-[#FFF7ED] rounded-lg">{rule.conditionLogic}</span>
                    )}
                    <div className="flex-1 px-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#0A0A0A]">{condition.field}</div>
                    <div className="w-28 px-3 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#5A5A5A]">{condition.operator}</div>
                    <div className="w-32 px-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm font-medium text-[#0A0A0A]">{condition.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 自动动作 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">自动动作</h3>
              <div className="space-y-4">
                {rule.actions.map((action, index) => (
                  <div key={index} className="p-4 bg-[#F5F5F5] rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      {action.type === 'auto_approve' && <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>}
                      {action.type === 'auto_reject' && <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>}
                      {action.type === 'add_approver' && <span className="w-2 h-2 rounded-full bg-[#2D3BFF]"></span>}
                      {action.type === 'skip_node' && <span className="w-2 h-2 rounded-full bg-[#CA8A04]"></span>}
                      {action.type === 'show_message' && <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>}
                      <span className="font-medium text-sm text-[#0A0A0A]">{actionTypes.find(t => t.value === action.type)?.label}</span>
                      {action.target && <span className="text-sm text-[#5A5A5A]">: {action.target}</span>}
                    </div>
                    {action.message && (
                      <div className="text-sm text-[#5A5A5A] pl-5">{action.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 实现方式 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-5">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">实现方式</h3>
              <div className="px-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#0A0A0A]">{rule.implementationMethod}</div>
            </div>
          </div>

          {/* 右侧 - 规则预览 */}
          <div className="col-span-5 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A] border-b border-[#EBEBEB] pb-3">规则预览</h3>
              <div className="space-y-4">
                {rule.approvalPoint && (
                  <div className="text-sm text-[#0A0A0A] font-medium">
                    审批点：<span className="text-[#2D3BFF]">{rule.approvalPoint}</span>
                  </div>
                )}
                <div className="p-4 bg-[#F5F5F5] rounded-xl">
                  <p className="text-sm text-[#999999] mb-2">当</p>
                  <div className="space-y-2">
                    {rule.conditions.filter(c => c.field).map((c, i, arr) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-[#E8F4FF] text-[#2D3BFF] rounded-lg">{c.field}</span>
                        <span className="text-[#5A5A5A]">{c.operator}</span>
                        <span className="px-2 py-1 bg-white rounded-lg font-medium text-[#0A0A0A]">{c.value}</span>
                        {i < arr.length - 1 && <span className="text-[#EA580C] font-medium ml-1">{rule.conditionLogic}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
                <div className="p-4 bg-[#F5F5F5] rounded-xl">
                  <p className="text-sm text-[#999999] mb-2">则执行</p>
                  <div className="space-y-2">
                    {rule.actions.filter(a => a.type).map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {a.type === 'auto_approve' && <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>}
                        {a.type === 'auto_reject' && <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>}
                        {a.type === 'add_approver' && <span className="w-2 h-2 rounded-full bg-[#2D3BFF]"></span>}
                        {a.type === 'skip_node' && <span className="w-2 h-2 rounded-full bg-[#CA8A04]"></span>}
                        {a.type === 'show_message' && <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>}
                        <span className="font-medium text-[#0A0A0A]">{actionTypes.find(t => t.value === a.type)?.label}</span>
                        {a.target && <span className="text-[#5A5A5A]">: {a.target}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                {rule.actions.some(a => a.message) && (
                  <div className="p-3 bg-[#E8F4FF] border border-[#2D3BFF]/10 rounded-xl">
                    <p className="text-sm text-[#2D3BFF]">
                      <span className="font-medium">提示：</span>{rule.actions.find(a => a.message)?.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
