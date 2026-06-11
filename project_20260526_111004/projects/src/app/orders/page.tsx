'use client';

import React, { useState } from 'react';
import { useApp, BillingEntity, BillingRule } from '@/lib/store';

interface OrderMapping {
  id: string;
  orderNumber: string;
  customerName: string;
  billingEntity: string;
  matchedRuleId: string;
  matchedRuleName: string;
  splitAt: string;
  operator: string;
  params: Record<string, string>;
}

const mockOrderMappings: OrderMapping[] = [
  { id: '1', orderNumber: 'COS-2024-001', customerName: '应用材料（中国）有限公司', billingEntity: 'FWD-8635', matchedRuleId: 'rule-001', matchedRuleName: '应用材料-FWD-上海-Plant非0002/0004-8635', splitAt: '2024-01-15 10:30:00', operator: '管理员', params: { department: 'FWD', location: '上海', plant: '1001' } },
  { id: '2', orderNumber: 'COS-2024-002', customerName: '应用材料（中国）有限公司', billingEntity: 'TKM-8603', matchedRuleId: 'rule-016', matchedRuleName: '应用材料-TKM-任意Location-8603', splitAt: '2024-01-15 11:00:00', operator: '管理员', params: { department: 'TKM', location: '北京', plant: '2001' } },
  { id: '3', orderNumber: 'COS-2024-003', customerName: '飞雅贸易（上海）有限公司', billingEntity: '物流部', matchedRuleId: 'rule-020', matchedRuleName: '飞雅贸易-物流部', splitAt: '2024-01-15 14:30:00', operator: '管理员', params: { billingDimension: '物流部' } },
  { id: '4', orderNumber: 'COS-2024-004', customerName: '荏原精密机械有限公司', billingEntity: 'CMP部门', matchedRuleId: 'rule-025', matchedRuleName: '荏原-CMP部门', splitAt: '2024-01-15 15:00:00', operator: '管理员', params: { billingDimension: 'CMP部门' } },
  { id: '5', orderNumber: 'COS-2024-005', customerName: '上海华力集成电路制造有限公司', billingEntity: '设备类', matchedRuleId: 'rule-037', matchedRuleName: '上海华力-设备', splitAt: '2024-01-16 09:00:00', operator: '管理员', params: { billingDimension: '设备' } },
];

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function OrdersPage() {
  const { splitFields, matchBillingEntity } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderMapping | null>(null);
  const [testParams, setTestParams] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ entity: BillingEntity | null; rule: BillingRule | null } | null>(null);

  const filteredOrders = mockOrderMappings.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.billingEntity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = !customerFilter || order.customerName === customerFilter;
    return matchesSearch && matchesCustomer;
  });

  const uniqueCustomers = [...new Set(mockOrderMappings.map(o => o.customerName))];

  const handleTest = () => {
    const result = matchBillingEntity(testParams);
    setTestResult(result);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">订单映射查询</h1>
        <p className="text-[#5A5A5A] mt-1">查询订单账单主体映射历史和测试规则匹配</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="搜索订单号、客户名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A]"
            />
          </div>
          <div>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A]"
            >
              <option value="">全部客户</option>
              {uniqueCustomers.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A]"
            />
          </div>
          <div>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
        <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">规则匹配测试</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-[#5A5A5A] mb-3">输入测试参数</h3>
            <div className="space-y-3">
              {splitFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm text-[#444444] mb-1.5">
                    {field.name} {field.required && <span className="text-[#D32F2F]">*</span>}
                  </label>
                  {field.type === 'text' ? (
                    <input
                      type="text"
                      value={testParams[field.fieldKey || field.id] || ''}
                      onChange={(e) => setTestParams({ ...testParams, [field.fieldKey || field.id]: e.target.value })}
                      placeholder={`输入${field.name}`}
                      className="w-full px-3 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A]"
                    />
                  ) : (
                    <select
                      value={testParams[field.fieldKey || field.id] || ''}
                      onChange={(e) => setTestParams({ ...testParams, [field.fieldKey || field.id]: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A]"
                    >
                      <option value="">选择{field.name}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleTest}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#2D3BFF] text-white rounded-lg hover:bg-[#1539E5] transition-colors font-medium"
            >
              <SearchIcon />
              <span>执行匹配测试</span>
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#5A5A5A] mb-3">匹配结果</h3>
            {testResult ? (
              <div className="space-y-4">
                {testResult.entity ? (
                  <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold text-[#2E7D32]">匹配成功</span>
                    </div>
                    <div className="ml-7">
                      <p className="text-sm text-[#388E3C]">
                        <span className="font-medium">账单主体：</span>
                        <span className="px-2 py-0.5 bg-white rounded ml-1 font-semibold">{testResult.entity.name}</span>
                      </p>
                      <p className="text-sm text-[#388E3C] mt-1">
                        <span className="font-medium">匹配规则：</span>
                        <span className="ml-1">{testResult.rule?.name}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-semibold text-[#D32F2F]">未匹配到任何规则</span>
                    </div>
                    <p className="text-sm text-[#D63031] mt-2 ml-7">请检查输入参数是否正确</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-[#999999] border-2 border-dashed border-[#EBEBEB] rounded-lg bg-[#FAFAFA]">
                <p>点击「执行匹配测试」查看结果</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EBEBEB]">
          <h2 className="text-lg font-semibold text-[#0A0A0A]">订单映射历史</h2>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#F8F8F8]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">订单号</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">客户名称</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">账单主体</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">命中规则</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">拆分时间</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#999999]">暂无订单数据</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-sm bg-[#F5F5F5] text-[#444444] px-2 py-1 rounded font-mono">{order.orderNumber}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#0A0A0A]">{order.customerName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                      {order.billingEntity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#5A5A5A]">{order.matchedRuleName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#999999]">{order.splitAt}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-[#2D3BFF] hover:underline text-sm font-medium"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">订单详情</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-[#999999] hover:text-[#0A0A0A] transition-colors">
                <CloseIcon />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#5A5A5A]">订单号</label>
                <p className="text-[#0A0A0A] mt-1"><code className="bg-[#F5F5F5] text-[#444444] px-2 py-1 rounded font-mono">{selectedOrder.orderNumber}</code></p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A]">客户名称</label>
                <p className="text-[#0A0A0A] mt-1 font-medium">{selectedOrder.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A]">账单主体</label>
                <p className="mt-1">
                  <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                    {selectedOrder.billingEntity}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A]">匹配规则</label>
                <p className="text-[#0A0A0A] mt-1">{selectedOrder.matchedRuleName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A]">拆分时间</label>
                <p className="text-[#0A0A0A] mt-1">{selectedOrder.splitAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A]">操作人</label>
                <p className="text-[#0A0A0A] mt-1">{selectedOrder.operator}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A]">输入参数</label>
                <div className="mt-2 p-3 bg-[#F8F8F8] rounded-lg">
                  {Object.entries(selectedOrder.params).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm py-1">
                      <span className="text-[#5A5A5A]">{key}:</span>
                      <span className="text-[#0A0A0A] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
