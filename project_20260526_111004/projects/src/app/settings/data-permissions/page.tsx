'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import type { Customer } from '@/lib/store';

// ==================== 类型定义 ====================

interface DataPermission {
  id: string;
  dimension: 'user' | 'role' | 'department';
  targetId: string;
  targetName: string;
  customerIds: string[];
  updatedAt: string;
}

type TabType = 'user' | 'role' | 'department';

interface TargetItem { id: string; name: string; sub?: string; }

// ==================== 多选客户选择器组件 ====================

function CustomerMultiSelect({
  selectedIds,
  onChange,
  customers,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  customers: { id: string; name: string; customerCode: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomers = customers.filter((c) => selectedIds.includes(c.id));

  const toggleCustomer = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    const allFilteredIds = filteredCustomers.map((c) => c.id);
    onChange(allFilteredIds);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="min-h-[42px] px-3 py-2 border border-[#EBEBEB] rounded-lg cursor-pointer flex flex-wrap gap-1.5 items-center hover:border-[#2D3BFF]/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCustomers.length === 0 ? (
          <span className="text-[#B0B8D1]">请选择客户</span>
        ) : (
          selectedCustomers.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#E8EBFF] text-[#2D3BFF] text-xs font-medium"
            >
              {c.name.length > 8 ? c.name.slice(0, 8) + '...' : c.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCustomer(c.id);
                }}
                className="ml-1 text-[#2D3BFF]/60 hover:text-[#2D3BFF]"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))
        )}
        <svg className={`ml-auto w-4 h-4 text-[#5A5A5A] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#EBEBEB] rounded-lg shadow-xl max-h-[280px] flex flex-col">
          <div className="p-2 border-b border-[#EBEBEB]">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B8D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索客户名称或ERP编码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2D3BFF]/30 focus:border-[#2D3BFF]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <button
                onClick={(e) => { e.stopPropagation(); selectAll(); }}
                className="text-xs text-[#2D3BFF] hover:text-[#4338CA] font-medium"
              >
                全选
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); clearAll(); }}
                className="text-xs text-[#5A5A5A] hover:text-[#EF4444] font-medium"
              >
                清空
              </button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredCustomers.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-[#B0B8D1]">无匹配客户</div>
            ) : (
              filteredCustomers.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => toggleCustomer(c.id)}
                    className="w-4 h-4 rounded border-[#D1D5DB] text-[#2D3BFF] focus:ring-[#2D3BFF]/30 mr-2.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#0A0A0A] truncate">{c.name}</div>
                    <div className="text-xs text-[#B0B8D1]">{c.customerCode}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="px-3 py-2 border-t border-[#EBEBEB] bg-[#F5F5F5] rounded-b-lg">
            <span className="text-xs text-[#5A5A5A]">已选择 {selectedIds.length} / {customers.length} 个客户</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 主页面组件 ====================

export default function DataPermissionsPage() {
  const { customers } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('user');
  const [permissions, setPermissions] = useState<DataPermission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<DataPermission | null>(null);
  const [editingTargetId, setEditingTargetId] = useState<string>('');
  const [editingTargetName, setEditingTargetName] = useState<string>('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiUsers, setApiUsers] = useState<Array<{ id: string; username: string; realName: string; department: string; email: string }>>([]);
  const [apiRoles, setApiRoles] = useState<Array<{ id: string; name: string; code: string }>>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [userRes, roleRes, permRes] = await Promise.all([
        fetch('/api/users'), fetch('/api/roles'), fetch('/api/data-permissions'),
      ]);
      const userData = await userRes.json();
      const roleData = await roleRes.json();
      const permData = await permRes.json();
      if (userData.success) setApiUsers(userData.data);
      if (roleData.success) setApiRoles(roleData.data);
      if (permData.success) setPermissions(permData.data);
    } catch { /* 静默处理 */ }
    finally { setLoading(false); }
  }

  // 获取当前tab的数据列表（从 API 数据构建）
  const getTargetList = (): TargetItem[] => {
    switch (activeTab) {
      case 'user':
        return apiUsers.map(u => ({ id: u.id, name: `${u.realName}（${u.username}）`, sub: u.department }));
      case 'role':
        return apiRoles.map(r => ({ id: r.id, name: r.name, sub: `编码：${r.code}` }));
      case 'department': {
        const deptMap = new Map<string, number>();
        apiUsers.forEach(u => { if (u.department) deptMap.set(u.department, (deptMap.get(u.department) || 0) + 1); });
        return Array.from(deptMap.entries()).map(([name, count], i) => ({
          id: name, name, sub: `${count}人`,
        }));
      }
    }
  };

  const targetList = getTargetList();

  // 搜索过滤
  const filteredTargets = targetList.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.sub && t.sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 获取某个对象的客户权限
  const getPermission = (targetId: string): DataPermission | undefined => {
    return permissions.find((p) => p.dimension === activeTab && p.targetId === targetId);
  };

  // 打开配置弹窗
  const openConfig = (targetId: string, targetName: string) => {
    const existing = getPermission(targetId);
    setEditingPermission(existing || null);
    setEditingTargetId(targetId);
    setEditingTargetName(targetName);
    setSelectedCustomerIds(existing?.customerIds || []);
    setShowConfigModal(true);
  };

  // 保存配置（调用 API 持久化）
  const saveConfig = async () => {
    try {
      await fetch('/api/data-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimension: activeTab, targetId: editingTargetId,
          targetName: editingTargetName, customerIds: selectedCustomerIds,
        }),
      });
      // 重新加载
      const permRes = await fetch('/api/data-permissions');
      const permData = await permRes.json();
      if (permData.success) setPermissions(permData.data);
    } catch { /* 静默处理 */ }
    setShowConfigModal(false);
    setEditingPermission(null);
    setEditingTargetId('');
    setEditingTargetName('');
    setSelectedCustomerIds([]);
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    {
      key: 'user',
      label: '用户权限',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
    {
      key: 'role',
      label: '角色权限',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
    },
    {
      key: 'department',
      label: '部门权限',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
  ];

  // 表格列定义
  const getColumns = () => {
    switch (activeTab) {
      case 'user':
        return ['序号', '账号', '姓名', '工号', '邮箱', '可见客户数', '更新时间', '操作'];
      case 'role':
        return ['序号', '角色名称', '角色编码', '关联用户数', '可见客户数', '更新时间', '操作'];
      case 'department':
        return ['序号', '部门名称', '部门编码', '部门人数', '可见客户数', '更新时间', '操作'];
    }
  };

  const getRowData = (item: { id: string; name: string; sub?: string }, index: number) => {
    const perm = getPermission(item.id);
    const col1 = index + 1;

    switch (activeTab) {
      case 'user': {
        const user = apiUsers.find((u) => u.id === item.id);
        return [col1, user?.username || '-', user?.realName || '-', '', user?.email || '-'];
      }
      case 'role': {
        const role = apiRoles.find((r) => r.id === item.id);
        return [col1, role?.name || '-', role?.code || '-', ''];
      }
      case 'department': {
        const deptName = item.id;
        const count = apiUsers.filter(u => u.department === deptName).length;
        return [col1, deptName, '', count];
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">数据权限管理</h1>
        <p className="text-sm text-[#5A5A5A] mt-1">配置用户、角色、部门的客户数据可见性</p>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB]">
        <div className="border-b border-[#EBEBEB]">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#2D3BFF] text-[#2D3BFF] bg-[#2D3BFF]/[0.03]'
                    : 'border-transparent text-[#5A5A5A] hover:text-[#0A0A0A] hover:bg-[#F5F5F5]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="p-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B8D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={activeTab === 'user' ? '搜索账号或姓名...' : activeTab === 'role' ? '搜索角色名称...' : '搜索部门名称...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
              />
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6"></path>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              重置
            </button>
          </div>
        </div>

        {/* 数据表格 */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#F5F5F5]">
                {getColumns().map((col, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] tracking-wider whitespace-nowrap ${
                      i === 0 ? 'text-center w-16' : ''
                    } ${col === '操作' ? 'text-center w-28' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {filteredTargets.map((item, index) => {
                const perm = getPermission(item.id);
                const rowData = getRowData(item, index);
                const visibleCount = perm?.customerIds.length || 0;

                return (
                  <tr key={item.id} className="hover:bg-[#F5F5F5] transition-colors">
                    {rowData.map((cell, i) => (
                      <td
                        key={i}
                        className={`px-4 py-3 text-sm whitespace-nowrap ${
                          i === 0 ? 'text-center text-[#5A5A5A]' : 'text-[#0A0A0A]'
                        } ${i === 1 ? 'font-medium' : ''}`}
                      >
                        {cell as React.ReactNode}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold ${
                        visibleCount > 0
                          ? 'bg-[#E8EBFF] text-[#2D3BFF]'
                          : 'bg-[#F1F5F9] text-[#B0B8D1]'
                      }`}>
                        {visibleCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#5A5A5A] whitespace-nowrap">
                      {perm?.updatedAt || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openConfig(item.id, item.name)}
                        className="inline-flex items-center gap-1 text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        设置
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页信息 */}
        <div className="px-4 py-3 border-t border-[#EBEBEB] flex items-center justify-between">
          <span className="text-sm text-[#5A5A5A]">共 {filteredTargets.length} 条</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors">上一页</button>
            <button className="px-3 py-1 rounded text-sm bg-[#2D3BFF] text-white">1</button>
            <button className="px-3 py-1 rounded text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors">下一页</button>
          </div>
        </div>
      </div>

      {/* 配置弹窗 */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[640px] max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#0A0A0A]">数据权限设置</h2>
                <p className="text-sm text-[#5A5A5A] mt-0.5">
                  {activeTab === 'user' ? '用户' : activeTab === 'role' ? '角色' : '部门'}：
                  <span className="font-medium text-[#0A0A0A]">{editingTargetName}</span>
                </p>
              </div>
              <button
                onClick={() => { setShowConfigModal(false); setEditingPermission(null); setEditingTargetId(''); setEditingTargetName(''); }}
                className="text-[#5A5A5A] hover:text-[#0A0A0A] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 可见客户范围说明 */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#2D3BFF] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-[#0A0A0A]">客户数据可见性</div>
                    <div className="text-sm text-[#5A5A5A] mt-1">
                      选择该{activeTab === 'user' ? '用户' : activeTab === 'role' ? '角色' : '部门'}可以查看的客户数据。未配置则表示不可查看任何客户数据。
                    </div>
                  </div>
                </div>
              </div>

              {/* 客户选择器 */}
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  可见客户 <span className="text-[#EF4444]">*</span>
                </label>
                <CustomerMultiSelect
                  selectedIds={selectedCustomerIds}
                  onChange={setSelectedCustomerIds}
                  customers={customers.map((c: { id: string; name: string; customerCode?: string }) => ({ id: c.id, name: c.name, customerCode: c.customerCode || '' }))}
                />
              </div>

              {/* 已选客户预览 */}
              {selectedCustomerIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                    已选客户预览
                  </label>
                  <div className="border border-[#EBEBEB] rounded-lg p-3 max-h-[200px] overflow-y-auto">
                    <div className="space-y-2">
                      {selectedCustomerIds.map((id) => {
                        const customer = customers.find((c) => c.id === id);
                        if (!customer) return null;
                        return (
                          <div key={id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#F5F5F5]">
                            <div>
                              <div className="text-sm text-[#0A0A0A]">{customer.name}</div>
                              <div className="text-xs text-[#B0B8D1]">{customer.customerCode}</div>
                            </div>
                            <button
                              onClick={() => setSelectedCustomerIds(selectedCustomerIds.filter((sid) => sid !== id))}
                              className="text-[#B0B8D1] hover:text-[#EF4444] transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#EBEBEB] flex justify-end gap-3">
              <button
                onClick={() => { setShowConfigModal(false); setEditingPermission(null); setEditingTargetId(''); setEditingTargetName(''); }}
                className="px-5 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveConfig}
                className="px-5 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
