'use client';

import { useState } from 'react';

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  userCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有功能的访问和管理权限',
    userCount: 3,
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-15 14:30:00',
  },
  {
    id: 'role-002',
    name: '财务人员',
    code: 'finance',
    description: '负责账单拆分规则配置和订单映射管理',
    userCount: 5,
    status: 'active',
    createdAt: '2024-01-02 09:00:00',
    updatedAt: '2024-01-10 11:20:00',
  },
  {
    id: 'role-003',
    name: '客户经理',
    code: 'customer_manager',
    description: '负责客户信息维护和上下游关系管理',
    userCount: 8,
    status: 'active',
    createdAt: '2024-01-03 14:00:00',
    updatedAt: '2024-01-12 16:45:00',
  },
  {
    id: 'role-004',
    name: '数据管理员',
    code: 'data_manager',
    description: '负责字典管理和字段配置',
    userCount: 2,
    status: 'active',
    createdAt: '2024-01-05 11:00:00',
    updatedAt: '2024-01-08 09:30:00',
  },
  {
    id: 'role-005',
    name: '审计人员',
    code: 'auditor',
    description: '负责查看操作日志和数据审计',
    userCount: 3,
    status: 'active',
    createdAt: '2024-01-06 16:00:00',
    updatedAt: '2024-01-14 10:15:00',
  },
];

export default function RolesPage() {
  const [roles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">角色管理</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">管理系统角色，配置角色权限</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>新增角色</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索角色名称或代码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
          >
            <option value="all">全部状态</option>
            <option value="active">已启用</option>
            <option value="inactive">已禁用</option>
          </select>
        </div>
      </div>

      {/* 角色列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#EBEBEB]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">角色名称</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">角色代码</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">描述</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">用户数</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">状态</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">创建时间</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {filteredRoles.map((role) => (
              <tr key={role.id} className="hover:bg-[#F5F5F5] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-[#0A0A0A] whitespace-nowrap">{role.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap font-mono">{role.code}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] max-w-xs truncate">{role.description}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8EBFF] text-[#2D3BFF]">
                    {role.userCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    role.status === 'active' 
                      ? 'bg-[#E8FCEF] text-[#22C55E]' 
                      : 'bg-[#FEE2E2] text-[#EF4444]'
                  }`}>
                    {role.status === 'active' ? '已启用' : '已禁用'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap">{role.createdAt}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium transition-colors"
                    >
                      编辑
                    </button>
                    <span className="text-[#EBEBEB]">|</span>
                    <button className="text-[#5A5A5A] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
                      权限
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
          <div className="text-sm text-[#5A5A5A]">总角色数</div>
          <div className="text-2xl font-bold text-[#0A0A0A] mt-1">{roles.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">已启用</div>
          <div className="text-2xl font-bold text-[#22C55E] mt-1">{roles.filter(r => r.status === 'active').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">已禁用</div>
          <div className="text-2xl font-bold text-[#EF4444] mt-1">{roles.filter(r => r.status === 'inactive').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">总用户数</div>
          <div className="text-2xl font-bold text-[#2D3BFF] mt-1">{roles.reduce((sum, r) => sum + r.userCount, 0)}</div>
        </div>
      </div>

      {/* 新增/编辑角色弹窗 */}
      {(showAddModal || editingRole) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">
                {editingRole ? '编辑角色' : '新增角色'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingRole(null); }}
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
                  角色名称 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={editingRole?.name}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                  placeholder="请输入角色名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">
                  角色代码 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={editingRole?.code}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] font-mono"
                  placeholder="请输入角色代码（英文）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">描述</label>
                <textarea
                  defaultValue={editingRole?.description}
                  rows={3}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] resize-none"
                  placeholder="请输入角色描述"
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
                      defaultChecked={!editingRole || editingRole.status === 'active'}
                      className="h-4 w-4 text-[#2D3BFF] focus:ring-[#2D3BFF] border-[#EBEBEB]"
                    />
                    <span className="ml-2 text-sm text-[#5A5A5A]">启用</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      defaultChecked={editingRole?.status === 'inactive'}
                      className="h-4 w-4 text-[#2D3BFF] focus:ring-[#2D3BFF] border-[#EBEBEB]"
                    />
                    <span className="ml-2 text-sm text-[#5A5A5A]">禁用</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EBEBEB] flex justify-end space-x-3">
              <button
                onClick={() => { setShowAddModal(false); setEditingRole(null); }}
                className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => { setShowAddModal(false); setEditingRole(null); }}
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
