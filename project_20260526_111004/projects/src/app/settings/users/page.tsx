'use client';

import { useState } from 'react';

interface User {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  department: string;
  roles: string[];
  status: 'active' | 'inactive';
  lastLoginTime: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@cim.com',
    phone: '138****1234',
    department: '信息技术部',
    roles: ['系统管理员'],
    status: 'active',
    lastLoginTime: '2024-01-15 14:30:00',
    createdAt: '2024-01-01 10:00:00',
  },
  {
    id: 'user-002',
    username: 'finance01',
    realName: '张三',
    email: 'zhangsan@cim.com',
    phone: '139****5678',
    department: '财务部',
    roles: ['财务人员'],
    status: 'active',
    lastLoginTime: '2024-01-15 09:15:00',
    createdAt: '2024-01-02 14:00:00',
  },
  {
    id: 'user-003',
    username: 'finance02',
    realName: '李四',
    email: 'lisi@cim.com',
    phone: '137****9012',
    department: '财务部',
    roles: ['财务人员'],
    status: 'active',
    lastLoginTime: '2024-01-14 16:45:00',
    createdAt: '2024-01-03 11:00:00',
  },
  {
    id: 'user-004',
    username: 'cm01',
    realName: '王五',
    email: 'wangwu@cim.com',
    phone: '136****3456',
    department: '客户服务部',
    roles: ['客户经理'],
    status: 'active',
    lastLoginTime: '2024-01-15 10:30:00',
    createdAt: '2024-01-04 09:00:00',
  },
  {
    id: 'user-005',
    username: 'dm01',
    realName: '赵六',
    email: 'zhaoliu@cim.com',
    phone: '135****7890',
    department: '数据中心',
    roles: ['数据管理员'],
    status: 'active',
    lastLoginTime: '2024-01-13 17:20:00',
    createdAt: '2024-01-05 15:00:00',
  },
  {
    id: 'user-006',
    username: 'auditor01',
    realName: '钱七',
    email: 'qianqi@cim.com',
    phone: '134****1234',
    department: '审计部',
    roles: ['审计人员'],
    status: 'inactive',
    lastLoginTime: '2024-01-10 11:00:00',
    createdAt: '2024-01-06 10:00:00',
  },
];

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2340]">用户管理</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">管理系统用户，分配角色权限</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>新增用户</span>
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索用户名、姓名或邮箱..."
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

      {/* 用户列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#EBEBEB]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">用户名</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">姓名</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">邮箱</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">部门</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">角色</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">状态</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">最后登录</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-[#F5F5F5] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-[#1E2340] whitespace-nowrap font-mono">{user.username}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#1E2340] whitespace-nowrap">{user.realName}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap">{user.department}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#E8EBFF] text-[#2D3BFF] whitespace-nowrap">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    user.status === 'active' 
                      ? 'bg-[#E8FCEF] text-[#22C55E]' 
                      : 'bg-[#FEE2E2] text-[#EF4444]'
                  }`}>
                    {user.status === 'active' ? '已启用' : '已禁用'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#5A5A5A] whitespace-nowrap">{user.lastLoginTime}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium transition-colors"
                    >
                      编辑
                    </button>
                    <span className="text-[#EBEBEB]">|</span>
                    <button className="text-[#5A5A5A] hover:text-[#1E2340] text-sm font-medium transition-colors">
                      重置密码
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
          <div className="text-sm text-[#5A5A5A]">总用户数</div>
          <div className="text-2xl font-bold text-[#1E2340] mt-1">{users.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">已启用</div>
          <div className="text-2xl font-bold text-[#22C55E] mt-1">{users.filter(u => u.status === 'active').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">已禁用</div>
          <div className="text-2xl font-bold text-[#EF4444] mt-1">{users.filter(u => u.status === 'inactive').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="text-sm text-[#5A5A5A]">今日活跃</div>
          <div className="text-2xl font-bold text-[#2D3BFF] mt-1">4</div>
        </div>
      </div>

      {/* 新增/编辑用户弹窗 */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1E2340]">
                {editingUser ? '编辑用户' : '新增用户'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                className="text-[#5A5A5A] hover:text-[#1E2340]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-1">
                    用户名 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={editingUser?.username}
                    className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] font-mono"
                    placeholder="请输入用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-1">
                    姓名 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={editingUser?.realName}
                    className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                    placeholder="请输入姓名"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-1">
                    邮箱 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="email"
                    defaultValue={editingUser?.email}
                    className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                    placeholder="请输入邮箱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-1">电话</label>
                  <input
                    type="text"
                    defaultValue={editingUser?.phone}
                    className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                    placeholder="请输入电话"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E2340] mb-1">部门</label>
                <input
                  type="text"
                  defaultValue={editingUser?.department}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                  placeholder="请输入部门"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E2340] mb-1">
                  角色 <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  multiple
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                  defaultValue={editingUser?.roles}
                >
                  <option value="系统管理员">系统管理员</option>
                  <option value="财务人员">财务人员</option>
                  <option value="客户经理">客户经理</option>
                  <option value="数据管理员">数据管理员</option>
                  <option value="审计人员">审计人员</option>
                </select>
                <p className="text-xs text-[#5A5A5A] mt-1">按住 Ctrl 键可多选</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E2340] mb-1">状态</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      defaultChecked={!editingUser || editingUser.status === 'active'}
                      className="h-4 w-4 text-[#2D3BFF] focus:ring-[#2D3BFF] border-[#EBEBEB]"
                    />
                    <span className="ml-2 text-sm text-[#5A5A5A]">启用</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      defaultChecked={editingUser?.status === 'inactive'}
                      className="h-4 w-4 text-[#2D3BFF] focus:ring-[#2D3BFF] border-[#EBEBEB]"
                    />
                    <span className="ml-2 text-sm text-[#5A5A5A]">禁用</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EBEBEB] flex justify-end space-x-3">
              <button
                onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => { setShowAddModal(false); setEditingUser(null); }}
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
