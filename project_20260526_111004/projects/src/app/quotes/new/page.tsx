'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';
import type { Customer } from '@/lib/types';

export default function NewQuotePage() {
  const router = useRouter();
  const { customers } = useApp();

  const [formData, setFormData] = useState({
    customerId: undefined as string | undefined,
    title: '',
    currency: 'CNY',
    validFrom: '',
    validTo: '',
    remark: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里添加保存逻辑
    alert('报价单已创建');
    router.push('/quotes');
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="border border-[#EBEBEB] text-[#5A5A5A] bg-white hover:bg-[#F3F4F6] hover:text-[#0A0A0A]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">新增报价单</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex-1">
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">基本信息</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-[#5A5A5A] block mb-2">
                  客户名称 <span className="text-[#FF3B30]">*</span>
                </label>
                <SearchableSelect
                  value={formData.customerId || ''}
                  onChange={(value) => setFormData({...formData, customerId: value || undefined})}
                  options={customers.map((c: Customer) => ({ value: c.id, label: c.name }))}
                  placeholder="请选择客户"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A] block mb-2">
                  报价单标题 <span className="text-[#FF3B30]">*</span>
                </label>
                <Input 
                  placeholder="请输入报价单标题"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A] block mb-2">币种</label>
                <SearchableSelect
                  value={formData.currency}
                  onChange={(value) => setFormData({...formData, currency: value})}
                  options={[
                    { value: 'CNY', label: 'CNY' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'JPY', label: 'JPY' },
                  ]}
                  placeholder="请选择币种"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A] block mb-2">
                  有效期开始 <span className="text-[#FF3B30]">*</span>
                </label>
                <Input 
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#5A5A5A] block mb-2">
                  有效期结束 <span className="text-[#FF3B30]">*</span>
                </label>
                <Input 
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-[#5A5A5A] block mb-2">备注</label>
                <Textarea 
                  placeholder="请输入备注信息"
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* 报价明细区域 */}
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">报价明细</h2>
              <Button variant="ghost" size="sm" className="text-[#2D3BFF] hover:bg-[#E8EBFF]">
                <Plus className="w-4 h-4 mr-2" />
                添加报价明细
              </Button>
            </div>
            <div className="text-center text-[#5A5A5A] py-12">
              暂无报价明细，点击上方"添加报价明细"按钮添加
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-[#F5F5F5] pt-4 pb-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.back()}
              className="border border-[#EBEBEB] text-[#5A5A5A] bg-white hover:bg-[#F3F4F6] hover:text-[#0A0A0A]"
            >
              取消
            </Button>
            <Button 
              type="button" 
              variant="ghost"
              className="border border-[#EBEBEB] text-[#5A5A5A] bg-white hover:bg-[#F3F4F6] hover:text-[#0A0A0A]"
            >
              <Save className="w-4 h-4 mr-2" />
              保存草稿
            </Button>
            <Button 
              type="submit"
              className="bg-[#2D3BFF] text-white hover:opacity-90 active:scale-[0.98] transition-all"
            >
              提交审批
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
