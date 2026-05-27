'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';
import { QuoteTemplate, QUOTE_TEMPLATE_BUSINESS_LABELS } from '@/lib/types';

export default function QuoteTemplatesPage() {
  const router = useRouter();
  const { quoteTemplates = [], addLog } = useApp();

  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterBusiness, setFilterBusiness] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // 弹窗状态
  const [showNewModal, setShowNewModal] = useState(false);

  // 筛选后的模板列表
  const filteredTemplates = useMemo(() => {
    return quoteTemplates.filter((template: QuoteTemplate) => {
      const matchKeyword =
        !searchKeyword ||
        template.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        template.maintainer.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchBusiness = !filterBusiness || template.business === filterBusiness;
      const matchStatus = !filterStatus || template.status === filterStatus;
      return matchKeyword && matchBusiness && matchStatus;
    });
  }, [quoteTemplates, searchKeyword, filterBusiness, filterStatus]);

  const handleToggleStatus = (template: QuoteTemplate) => {
    const newStatus = template.status === 'enabled' ? 'disabled' : 'enabled';
    addLog({
      module: 'quote_templates',
      operator: '当前用户',
      action: 'update',
      target: template.name,
      details: `状态变更为${newStatus === 'enabled' ? '启用' : '停用'}`,
    });
  };

  const handleBack = () => {
    router.push('/quotes');
  };

  return (
    <AppLayout>
      <div className="p-5">
        {/* 头部操作区 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#5A5A5A] hover:text-[#0A0A0A] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">返回</span>
            </button>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-[#2D3BFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            新建模板
          </button>
        </div>

        {/* 搜索筛选区 */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-[#F5F5F5] border-none rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 transition-colors"
              placeholder="搜索模板名称、维护人..."
            />
          </div>
          <select
            value={filterBusiness}
            onChange={(e) => setFilterBusiness(e.target.value)}
            className="bg-[#F5F5F5] border-none rounded-lg px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 transition-colors"
          >
            <option value="">全部业务</option>
            <option value="forwarding">货代</option>
            <option value="customs">关务</option>
            <option value="warehousing">仓储</option>
            <option value="transportation">运输</option>
            <option value="import_export">进出口</option>
            <option value="repair">维修</option>
            <option value="contract_logistics">合同物流</option>
            <option value="integrated_supply_chain">一体化供应链</option>
            <option value="other">其他</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F5F5F5] border-none rounded-lg px-3 py-2 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 transition-colors"
          >
            <option value="">全部状态</option>
            <option value="enabled">启用</option>
            <option value="disabled">停用</option>
          </select>
        </div>

        {/* 模板列表 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#EBEBEB]">
          <div className="grid grid-cols-10 px-4 py-3 bg-[#F5F5F5] text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide">
            <span className="col-span-1">模板名称</span>
            <span className="col-span-1">适用业务</span>
            <span className="col-span-1">版本号</span>
            <span className="col-span-1">费用行数</span>
            <span className="col-span-1">维护人</span>
            <span className="col-span-1">最近更新</span>
            <span className="col-span-1">状态</span>
            <span className="col-span-1">客服可见</span>
            <span className="col-span-1">备注说明</span>
            <span className="col-span-1">操作</span>
          </div>
          <div className="divide-y divide-[#D5D5D5]">
            {filteredTemplates.map((template: QuoteTemplate) => (
              <div
                key={template.id}
                className="grid grid-cols-10 px-4 py-3 hover:bg-[#F5F5F5]/50 transition-colors items-center"
              >
                <span className="col-span-1 text-sm font-medium text-[#0A0A0A] truncate">
                  {template.name}
                </span>
                <span className="col-span-1 text-sm text-[#5A5A5A]">
                  {QUOTE_TEMPLATE_BUSINESS_LABELS[template.business]}
                </span>
                <span className="col-span-1 text-sm text-[#5A5A5A]">
                  {template.version}
                </span>
                <span className="col-span-1 text-sm text-[#5A5A5A]">
                  {template.itemCount}
                </span>
                <span className="col-span-1 text-sm text-[#5A5A5A]">
                  {template.maintainer}
                </span>
                <span className="col-span-1 text-sm text-[#5A5A5A]">
                  {template.lastUpdated}
                </span>
                <span className="col-span-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${
                      template.status === 'enabled'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {template.status === 'enabled' ? '启用' : '停用'}
                  </span>
                </span>
                <span className="col-span-1">
                  {template.isCustomerServiceVisible ? (
                    <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                  )}
                </span>
                <span className="col-span-1 text-sm text-[#5A5A5A] truncate">
                  {template.remark}
                </span>
                <span className="col-span-1 flex items-center gap-2">
                  <button className="text-[#2D3BFF] text-sm font-medium hover:underline w-fit">
                    编辑
                  </button>
                  <button
                    onClick={() => handleToggleStatus(template)}
                    className={`text-sm font-medium hover:underline w-fit ${
                      template.status === 'enabled' ? 'text-[#f59e0b]' : 'text-green-600'
                    }`}
                  >
                    {template.status === 'enabled' ? '停用' : '启用'}
                  </button>
                  <button className="text-[#2D3BFF] text-sm font-medium hover:underline w-fit">
                    复制
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 新建模板弹窗 */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4">新建报价模板</h3>
              <p className="text-sm text-[#5A5A5A] mb-6">
                新建报价模板功能开发中，敬请期待...
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="bg-[#F5F5F5] text-[#0A0A0A] border-none px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#EBEBEB] active:scale-[0.98] transition-all"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="bg-[#2D3BFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}