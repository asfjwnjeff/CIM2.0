'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

type TabType = 'fields' | 'logs';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { splitFields, operationLogs } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>(
    searchParams.get('tab') === 'logs' ? 'logs' : 'fields'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // 过滤字段
  const filteredFields = splitFields.filter(field => {
    const searchMatch = !searchTerm || 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (field.fieldKey || '').toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  // 过滤日志
  const filteredLogs = operationLogs.filter(log => {
    const searchMatch = !searchTerm || 
      (log.operator || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (log.target || '').toLowerCase().includes(searchTerm.toLowerCase());
    const actionMatch = !actionFilter || log.action.includes(actionFilter);
    return searchMatch && actionMatch;
  });

  // 获取所有操作类型
  const actionTypes = Array.from(new Set(operationLogs.map(log => log.action)));

  const handleExportLogs = () => {
    alert('导出功能开发中...');
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'fields', label: '拆分字段管理' },
    { key: 'logs', label: '操作日志查询' },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0A0A0A]">系统设置</h1>
          <p className="text-[#5A5A5A] mt-1">管理拆分字段配置和查看系统操作日志</p>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-[#EBEBEB] mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key 
                  ? 'text-[#2D3BFF]' 
                  : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D3BFF]" />
              )}
            </button>
          ))}
        </div>

        {/* 拆分字段管理 */}
        {activeTab === 'fields' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <p className="text-sm text-[#5A5A5A]">
                配置可用于拆分规则的条件字段，支持字符串、下拉选择等类型
              </p>
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2D3BFF] text-white rounded-lg hover:bg-[#1539E5] transition-colors text-sm font-medium">
                <PlusIcon />
                新增字段
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[#F8F8F8]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-48">字段标识</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-36">显示名称</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-28">字段类型</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">可选值</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-20">必填</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-28">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {filteredFields.map((field, index) => (
                    <tr key={field.fieldKey || index} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <code className="text-sm bg-[#F0F4FF] text-[#2D3BFF] px-2 py-1 rounded font-mono">
                          {field.fieldKey || field.id}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-[#0A0A0A]">{field.name}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-[#F5F5F5] text-[#5A5A5A]">
                          {field.type === 'text' ? '字符串' : 
                           field.type === 'select' ? '下拉选择' : '多选'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {field.options && field.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {field.options?.slice(0, 5).map((opt, idx) => (
                              <span key={idx} className="inline-flex px-2 py-0.5 text-xs rounded bg-[#F5F5F5] text-[#5A5A5A]">
                                {opt}
                              </span>
                            ))}
                            {field.options && field.options.length > 5 && (
                              <span className="text-xs text-[#999999]">
                                +{field.options.length - 5} 更多
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-[#999999]">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          field.required 
                            ? 'bg-[#FFF3E0] text-[#E65100]' 
                            : 'bg-[#F5F5F5] text-[#5A5A5A]'
                        }`}>
                          {field.required ? '是' : '否'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 text-[#2D3BFF] hover:bg-[#F0F4FF] rounded transition-colors">
                            <EditIcon />
                          </button>
                          <button className="p-1.5 text-[#D32F2F] hover:bg-[#FFEBEE] rounded transition-colors">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 字段类型说明 */}
            <div className="mt-5 p-4 bg-[#F0F4FF] border border-[#D1E0FF] rounded-xl">
              <h4 className="text-sm font-semibold text-[#2D3BFF] mb-3">
                字段类型说明
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-[#0A0A0A]">字符串 (text)</strong>
                  <p className="text-[#5A5A5A] mt-1">
                    支持文本输入，可用于精确匹配、模糊匹配、正则匹配等
                  </p>
                </div>
                <div>
                  <strong className="text-[#0A0A0A]">下拉选择 (select)</strong>
                  <p className="text-[#5A5A5A] mt-1">
                    预设选项列表，支持等于、不等于、在列表中等操作符
                  </p>
                </div>
                <div>
                  <strong className="text-[#0A0A0A]">多选 (multiselect)</strong>
                  <p className="text-[#5A5A5A] mt-1">
                    支持多选，预设选项列表
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 操作日志查询 */}
        {activeTab === 'logs' && (
          <div>
            {/* 搜索栏 */}
            <div className="flex gap-3 mb-5">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="搜索操作人、操作内容..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2.5 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#2D3BFF] focus:border-transparent text-[#0A0A0A] w-48"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">全部操作类型</option>
                {actionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button 
                className="flex items-center gap-1.5 px-4 py-2.5 border border-[#DDDDDD] text-[#0A0A0A] rounded-lg hover:bg-[#FAFAFA] transition-colors text-sm font-medium"
                onClick={handleExportLogs}
              >
                <DownloadIcon />
                导出日志
              </button>
            </div>

            {/* 日志列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[#F8F8F8]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-36">操作人</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-28">操作类型</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-36">操作对象</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">变更详情</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider w-44">时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 rounded-full bg-[#E8F0FE] text-[#2D3BFF] flex items-center justify-center text-xs font-semibold">
                            {(log.operator || '?').charAt(0)}
                          </span>
                          <span className="text-[#0A0A0A]">{log.operator || '-'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          log.action.includes('创建') ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                          log.action.includes('删除') ? 'bg-[#FFEBEE] text-[#D32F2F]' :
                          log.action.includes('修改') ? 'bg-[#FFF3E0] text-[#E65100]' :
                          'bg-[#E8F0FE] text-[#2D3BFF]'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#0A0A0A]">{log.target}</td>
                      <td className="px-5 py-4 text-sm text-[#5A5A5A]">{log.details}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-[#999999]">
                          <ClockIcon />
                          {log.timestamp}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#5A5A5A]">加载中...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
