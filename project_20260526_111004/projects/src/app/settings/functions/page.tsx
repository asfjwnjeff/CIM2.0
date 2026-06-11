'use client';

import { useState } from 'react';

interface FunctionItem {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentName: string;
  path: string;
  status: 'active' | 'inactive';
  sort: number;
}

const mockFunctions: FunctionItem[] = [
  { id: 'func-001', name: '首页', code: 'dashboard', type: 'menu', parentName: '-', path: '/', status: 'active', sort: 1 },
  { id: 'func-002', name: '客户管理', code: 'customers', type: 'menu', parentName: '-', path: '/customers', status: 'active', sort: 2 },
  { id: 'func-003', name: '客户列表', code: 'customers_list', type: 'menu', parentName: '客户管理', path: '/customers', status: 'active', sort: 1 },
  { id: 'func-004', name: '客户详情', code: 'customers_detail', type: 'menu', parentName: '客户管理', path: '/customers/[id]', status: 'active', sort: 2 },
  { id: 'func-005', name: '新增客户', code: 'customers_add', type: 'button', parentName: '客户管理', path: '-', status: 'active', sort: 3 },
  { id: 'func-006', name: '编辑客户', code: 'customers_edit', type: 'button', parentName: '客户管理', path: '-', status: 'active', sort: 4 },
  { id: 'func-007', name: '删除客户', code: 'customers_delete', type: 'button', parentName: '客户管理', path: '-', status: 'active', sort: 5 },
  { id: 'func-008', name: '账单主体规则管理', code: 'rules', type: 'menu', parentName: '-', path: '/rules', status: 'active', sort: 3 },
  { id: 'func-009', name: '新增规则', code: 'rules_add', type: 'button', parentName: '账单主体规则管理', path: '-', status: 'active', sort: 1 },
  { id: 'func-010', name: '编辑规则', code: 'rules_edit', type: 'button', parentName: '账单主体规则管理', path: '-', status: 'active', sort: 2 },
  { id: 'func-011', name: '删除规则', code: 'rules_delete', type: 'button', parentName: '账单主体规则管理', path: '-', status: 'active', sort: 3 },
  { id: 'func-012', name: '字典管理', code: 'fields', type: 'menu', parentName: '系统管理', path: '/settings/fields', status: 'active', sort: 1 },
  { id: 'func-013', name: '角色管理', code: 'roles', type: 'menu', parentName: '权限管理', path: '/settings/roles', status: 'active', sort: 1 },
  { id: 'func-014', name: '用户管理', code: 'users', type: 'menu', parentName: '权限管理', path: '/settings/users', status: 'active', sort: 2 },
  { id: 'func-015', name: '功能管理', code: 'functions', type: 'menu', parentName: '权限管理', path: '/settings/functions', status: 'active', sort: 3 },
  { id: 'func-016', name: '数据权限管理', code: 'data_permissions', type: 'menu', parentName: '权限管理', path: '/settings/data-permissions', status: 'active', sort: 4 },
];

export default function FunctionsPage() {
  const [functions] = useState<FunctionItem[]>(mockFunctions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionItem | null>(null);

  const filteredFunctions = functions.filter(func => {
    const matchesSearch = func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          func.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || func.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'menu': return '菜单';
      case 'button': return '按钮';
      case 'api': return '接口';
      default: return type;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'menu': return 'bg-[#E8EBFF] text-[#2D3BFF]';
      case 'button': return 'bg-[#E8FCEF] text-[#22C55E]';
      case 'api': return 'bg-[#FEF3C7] text-[#F59E0B]';
      default: return 'bg-[#F1F5F9] text-[#5A5A5A]';
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">功能管理</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">管理系统功能菜单和操作权限</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>新增功能</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索功能名称或代码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
          >
            <option value="all">全部类型</option>
            <option value="menu">菜单</option>
            <option value="button">按钮</option>
            <option value="api">接口</option>
          </select>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#EBEBEB]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">功能名称</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">功能代码</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">类型</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">上级功能</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">路径</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">排序</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">状态</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {filteredFunctions.map((func) => (
              <tr key={func.id} className="hover:bg-[#F5F5F5] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-[#0A0A0A] whitespace-nowrap">{func.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap font-mono">{func.code}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getTypeStyle(func.type)}`}>
                    {getTypeLabel(func.type)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap">{func.parentName}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap font-mono">{func.path}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-sm text-[#5A5A5A]">{func.sort}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    func.status === 'active' 
                      ? 'bg-[#E8FCEF] text-[#22C55E]' 
                      : 'bg-[#FEE2E2] text-[#EF4444]'
                  }`}>
                    {func.status === 'active' ? '已启用' : '已禁用'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setEditingFunction(func)}
                      className="text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium transition-colors"
                    >
                      编辑
                    </button>
                    <span className="text-[#EBEBEB]">|</span>
                    <button className="text-[#EF4444] hover:text-[#DC2626] text-sm font-medium transition-colors">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">总功能数</div>
          <div className="text-2xl font-bold text-[#0A0A0A] mt-1">{functions.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">菜单</div>
          <div className="text-2xl font-bold text-[#2D3BFF] mt-1">{functions.filter(f => f.type === 'menu').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">按钮</div>
          <div className="text-2xl font-bold text-[#22C55E] mt-1">{functions.filter(f => f.type === 'button').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">接口</div>
          <div className="text-2xl font-bold text-[#F59E0B] mt-1">{functions.filter(f => f.type === 'api').length}</div>
        </div>
      </div>

      {/* 新增/编辑功能弹窗 */}
      {(showAddModal || editingFunction) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">
                {editingFunction ? '编辑功能' : '新增功能'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingFunction(null); }}
                className="text-[#5A5A5A] hover:text-[#0A0A0A]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">
                  功能名称 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={editingFunction?.name}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                  placeholder="请输入功能名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">
                  功能代码 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={editingFunction?.code}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] font-mono"
                  placeholder="请输入功能代码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">
                  类型 <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  defaultValue={editingFunction?.type || 'menu'}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                >
                  <option value="menu">菜单</option>
                  <option value="button">按钮</option>
                  <option value="api">接口</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">上级功能</label>
                <select
                  defaultValue={editingFunction?.parentName || '-'}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                >
                  <option value="-">无（顶级菜单）</option>
                  <option value="客户管理">客户管理</option>
                  <option value="账单主体规则管理">账单主体规则管理</option>
                  <option value="系统管理">系统管理</option>
                  <option value="权限管理">权限管理</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">路径</label>
                <input
                  type="text"
                  defaultValue={editingFunction?.path}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] font-mono"
                  placeholder="请输入路径（如 /customers）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">排序</label>
                <input
                  type="number"
                  defaultValue={editingFunction?.sort || 1}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                  placeholder="请输入排序号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">状态</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      defaultChecked={!editingFunction || editingFunction.status === 'active'}
                      className="h-4 w-4 text-[#2D3BFF] focus:ring-[#2D3BFF] border-[#EBEBEB]"
                    />
                    <span className="ml-2 text-sm text-[#5A5A5A]">启用</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      defaultChecked={editingFunction?.status === 'inactive'}
                      className="h-4 w-4 text-[#2D3BFF] focus:ring-[#2D3BFF] border-[#EBEBEB]"
                    />
                    <span className="ml-2 text-sm text-[#5A5A5A]">禁用</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EBEBEB] flex justify-end space-x-3">
              <button
                onClick={() => { setShowAddModal(false); setEditingFunction(null); }}
                className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => { setShowAddModal(false); setEditingFunction(null); }}
                className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
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
