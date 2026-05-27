'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';
import type { Quote, QuoteItem } from '@/lib/types';

// 内联SVG图标
const icons = {
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  save: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`
};

const Page: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { quotes, updateQuote, addLog } = useApp();

  const [formData, setFormData] = useState<Partial<Quote>>({
    quoteNumber: '',
    quoteName: '',
    customerId: '',
    customerName: '',
    opportunityId: '',
    opportunityName: '',
    businessTemplate: '',
    hmgEntity: '',
    department: '',
    initiator: '',
    currency: 'CNY',
    isTaxIncluded: true,
    taxRate: '13%',
    effectiveDate: '',
    expiryDate: '',
    statement: '本报价在有效期内有效，最终价格以实际发生费用为准。',
    items: []
  });

  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const foundQuote = quotes.find(q => q.id === id);
    if (foundQuote) {
      setQuote(foundQuote);
      setFormData(foundQuote);
    }
  }, [id, quotes]);

  // 计算价格
  const calculateTotals = () => {
    const items = formData.items || [];
    let totalBeforeDiscount = 0;
    let totalDiscount = 0;
    let totalAmount = 0;

    items.forEach(item => {
      const unitPrice = item.unitPrice || 0;
      const quantity = item.quantity || 0;
      const discountPercent = parseFloat(item.discountPercent || '100') / 100;
      
      const lineBeforeDiscount = unitPrice * quantity;
      const lineDiscountAfter = unitPrice * discountPercent * quantity;
      const lineDiscount = lineBeforeDiscount - lineDiscountAfter;

      totalBeforeDiscount += lineBeforeDiscount;
      totalDiscount += lineDiscount;
      totalAmount += lineDiscountAfter;
    });

    return { totalBeforeDiscount, totalDiscount, totalAmount };
  };

  const totals = calculateTotals();

  const handleHeaderChange = (field: keyof Quote, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const items = [...(formData.items || [])];
    items[index] = { ...items[index], [field]: value };
    setFormData(prev => ({ ...prev, items }));
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: `item-${(formData.items || []).length + 1}`,
      businessGroup: '进出口代理',
      productL1: '',
      productL2: '',
      productL3: '',
      englishName: '',
      billingUnit: '票',
      quantity: 1,
      unit: '票',
      unitPrice: 0,
      discountPercent: '100',
      discountAfterUnitPrice: 0,
      remark: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const removeItem = (index: number) => {
    const items = [...(formData.items || [])];
    items.splice(index, 1);
    setFormData(prev => ({ ...prev, items }));
  };

  const handleSave = () => {
    if (!quote) return;
    
    updateQuote(quote.id, {
      ...formData,
      totalBeforeDiscount: totals.totalBeforeDiscount,
      totalDiscount: totals.totalDiscount,
      totalAmount: totals.totalAmount
    });

    addLog({
      module: 'quotes',
      operator: '当前用户',
      action: 'update',
      target: quote.quoteNumber || quote.id,
      targetName: quote.quoteName || quote.title || '',
      details: '保存报价单信息',
      fieldName: 'quote'
    });

    router.push(`/quotes/${id}`);
  };

  if (!quote) {
    return (
      <AppLayout>
        <div className="p-5 min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 50%, #EBEBEB 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-[#5A5A5A]">加载中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 50%, #EBEBEB 100%)' }}>
        {/* 页面头部 */}
        <div className="bg-white border-b border-[#EBEBEB] h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/quotes/${id}`)}
              className="flex items-center gap-2 text-[#5A5A5A] hover:text-[#0A0A0A] transition-colors"
            >
              <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
              <span className="text-sm">返回</span>
            </button>
            <h1 className="text-xl font-semibold text-[#0A0A0A]">编辑报价单</h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-[#F59E0B]/15 text-[#F59E0B]">编辑中</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2D3BFF] text-white flex items-center justify-center text-sm font-medium">
                初
              </div>
              <span className="text-sm text-[#0A0A0A]">小初</span>
            </div>
          </div>
        </div>

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 区块一：报价单头信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5 hover:shadow-md hover:border-[#2D3BFF]/30 transition-all">
              <h2 className="text-base font-semibold text-[#0A0A0A] mb-4">报价单头信息</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">报价单编号</label>
                  <input
                    type="text"
                    value={formData.quoteNumber || ''}
                    onChange={(e) => handleHeaderChange('quoteNumber', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">报价单名称</label>
                  <input
                    type="text"
                    value={formData.quoteName || formData.title || ''}
                    onChange={(e) => handleHeaderChange('quoteName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">关联客户</label>
                  <input
                    type="text"
                    value={formData.customerName || ''}
                    onChange={(e) => handleHeaderChange('customerName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#2D3BFF] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">关联商机</label>
                  <input
                    type="text"
                    value={formData.opportunityName || ''}
                    onChange={(e) => handleHeaderChange('opportunityName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#2D3BFF] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">业务模板</label>
                  <input
                    type="text"
                    value={formData.businessTemplate || ''}
                    onChange={(e) => handleHeaderChange('businessTemplate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">泓明主体</label>
                  <input
                    type="text"
                    value={formData.hmgEntity || ''}
                    onChange={(e) => handleHeaderChange('hmgEntity', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">部门</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => handleHeaderChange('department', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">报价发起人</label>
                  <input
                    type="text"
                    value={formData.initiator || formData.ownerName || ''}
                    onChange={(e) => handleHeaderChange('initiator', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">币种</label>
                  <select
                    value={formData.currency || 'CNY'}
                    onChange={(e) => handleHeaderChange('currency', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  >
                    <option value="CNY">CNY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">是否含税</label>
                  <select
                    value={formData.isTaxIncluded ? '是' : '否'}
                    onChange={(e) => handleHeaderChange('isTaxIncluded', e.target.value === '是')}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  >
                    <option value="是">是</option>
                    <option value="否">否</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">税率</label>
                  <input
                    type="text"
                    value={formData.taxRate || ''}
                    onChange={(e) => handleHeaderChange('taxRate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">生效时间</label>
                  <input
                    type="date"
                    value={formData.effectiveDate || formData.validFrom || ''}
                    onChange={(e) => handleHeaderChange('effectiveDate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5A5A5A]">失效时间</label>
                  <input
                    type="date"
                    value={formData.expiryDate || formData.validTo || ''}
                    onChange={(e) => handleHeaderChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                <div className="space-y-1 col-span-3">
                  <label className="text-xs font-medium text-[#5A5A5A]">声明</label>
                  <textarea
                    value={formData.statement || ''}
                    onChange={(e) => handleHeaderChange('statement', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 区块二：报价明细行 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden hover:shadow-md hover:border-[#2D3BFF]/30 transition-all">
              <div className="px-5 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#0A0A0A]">报价明细行</h2>
                <button
                  onClick={addItem}
                  className="bg-[#2D3BFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2"
                >
                  <span dangerouslySetInnerHTML={{ __html: icons.plus }} />
                  添加明细
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F5F5] text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">业务分组</th>
                      <th className="px-4 py-3 text-left">产品L1</th>
                      <th className="px-4 py-3 text-left">产品L2</th>
                      <th className="px-4 py-3 text-left">产品L3</th>
                      <th className="px-4 py-3 text-left">英文名称</th>
                      <th className="px-4 py-3 text-left">计费单位</th>
                      <th className="px-4 py-3 text-right">单价</th>
                      <th className="px-4 py-3 text-right">行折扣</th>
                      <th className="px-4 py-3 text-right">行折扣后单价</th>
                      <th className="px-4 py-3 text-left">备注</th>
                      <th className="px-4 py-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBEBEB]">
                    {(formData.items || []).map((item, index) => (
                      <tr key={item.id} className="hover:bg-[#F5F5F5]/50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.businessGroup || ''}
                            onChange={(e) => handleItemChange(index, 'businessGroup', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.productL1 || ''}
                            onChange={(e) => handleItemChange(index, 'productL1', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.productL2 || ''}
                            onChange={(e) => handleItemChange(index, 'productL2', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.productL3 || ''}
                            onChange={(e) => handleItemChange(index, 'productL3', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.englishName || ''}
                            onChange={(e) => handleItemChange(index, 'englishName', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#5A5A5A] focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.billingUnit || item.unit || ''}
                            onChange={(e) => handleItemChange(index, 'billingUnit', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            value={item.unitPrice || 0}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#0A0A0A] font-medium text-right focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="text"
                            value={item.discountPercent || '100%'}
                            onChange={(e) => handleItemChange(index, 'discountPercent', e.target.value)}
                            className="w-20 px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#0A0A0A] text-right focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            value={(item.unitPrice || 0) * (parseFloat(item.discountPercent || '100') / 100)}
                            readOnly
                            className="w-24 px-2 py-1 bg-[#F5F5F5] border border-transparent rounded text-sm text-[#0A0A0A] font-medium text-right"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.remark || ''}
                            onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#D5D5D5] rounded text-sm text-[#5A5A5A] focus:outline-none focus:border-[#2D3BFF] focus:bg-white transition-all"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-[#EF4444] hover:text-[#DC2626] p-1 transition-colors"
                            title="删除"
                          >
                            <span dangerouslySetInnerHTML={{ __html: icons.trash }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 bg-[#F5F5F5] border-t border-[#EBEBEB] flex justify-end items-center gap-8">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#5A5A5A]">折扣前总价:</span>
                  <span className="text-base font-semibold text-[#0A0A0A]">¥{totals.totalBeforeDiscount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#5A5A5A]">折扣总额:</span>
                  <span className="text-base font-semibold text-[#EF4444]">-¥{totals.totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#5A5A5A]">报价总价:</span>
                  <span className="text-xl font-bold text-[#2D3BFF]">¥{totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5 hover:shadow-md hover:border-[#2D3BFF]/30 transition-all">
              <h2 className="text-base font-semibold text-[#0A0A0A] mb-4">操作</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  className="bg-[#2D3BFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2"
                >
                  <span dangerouslySetInnerHTML={{ __html: icons.save }} />
                  保存
                </button>
                <button
                  onClick={() => router.push(`/quotes/${id}`)}
                  className="bg-[#F5F5F5] text-[#0A0A0A] border-none px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#EBEBEB] active:scale-[0.98] transition-all inline-flex items-center gap-2"
                >
                  取消
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Page;
