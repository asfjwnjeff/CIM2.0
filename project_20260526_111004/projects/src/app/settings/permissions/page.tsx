'use client';

import { useState, useEffect } from 'react';

interface RoleData {
  id: string;
  name: string;
  code: string;
  description: string;
  permissionIds: string[];
}

interface PermissionData {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button';
  parentId: string | null;
}

export default function PermissionsPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [roleRes, permRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions'),
      ]);
      const roleData = await roleRes.json();
      const permData = await permRes.json();
      if (roleData.success) setRoles(roleData.data);
      if (permData.success) setPermissions(permData.data);
      if (!roleData.success || !permData.success) {
        setError('加载数据失败');
      }
    } catch {
      setError('加载数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }

  // 按类型分组权限
  const menuPermissions = permissions.filter(p => p.type === 'menu');
  const buttonPermissions = permissions.filter(p => p.type === 'button');

  async function togglePermission(roleId: string, permId: string, has: boolean) {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const prevPermIds = [...role.permissionIds];
    const newPermIds = has
      ? role.permissionIds.filter(id => id !== permId)
      : [...role.permissionIds, permId];

    // 乐观更新 UI
    setRoles(prev => prev.map(r =>
      r.id === roleId ? { ...r, permissionIds: newPermIds } : r
    ));

    setSaving(roleId);
    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roleId, permissionIds: newPermIds }),
      });
      if (!res.ok) throw new Error('API error');
    } catch {
      // API 失败时回滚到之前的状态
      setRoles(prev => prev.map(r =>
        r.id === roleId ? { ...r, permissionIds: prevPermIds } : r
      ));
      setError('保存失败，已回滚');
    } finally {
      setSaving(null);
    }
  }

  if (loading && roles.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-6">
        <div className="animate-pulse bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-12 flex items-center justify-center">
          <span className="text-[#B0B8D1]">加载中...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">权限管理</h1>
        <p className="text-sm text-[#5A5A5A] mt-1">为角色分配菜单和按钮操作权限</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-sm text-[#EF4444] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="text-[#EF4444] underline hover:text-[#DC2626] font-medium text-xs">
            重试
          </button>
        </div>
      )}

      {/* 角色-权限矩阵 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        {/* 菜单权限区 */}
        <div className="p-6 border-b border-[#EBEBEB]">
          <h2 className="text-base font-semibold text-[#0A0A0A] mb-1">菜单权限</h2>
          <p className="text-xs text-[#5A5A5A] mb-4">控制左侧导航菜单的可见性</p>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#EBEBEB]">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#5A5A5A] whitespace-nowrap w-48">菜单项</th>
                  {roles.map(role => (
                    <th key={role.id} className="px-3 py-2 text-center text-xs font-semibold text-[#5A5A5A] whitespace-nowrap min-w-[100px]">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {menuPermissions.map(perm => (
                  <tr key={perm.id} className="border-b border-[#EBEBEB]/50 hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-[#0A0A0A]">{perm.name}</div>
                      <div className="text-xs text-[#B0B8D1] font-mono">{perm.code}</div>
                    </td>
                    {roles.map(role => (
                      <td key={`${role.id}-${perm.id}`} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissionIds?.includes(perm.id) || false}
                          onChange={() => togglePermission(role.id, perm.id, role.permissionIds?.includes(perm.id) || false)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#2D3BFF] focus:ring-[#2D3BFF]/30 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 按钮权限区 */}
        <div className="p-6">
          <h2 className="text-base font-semibold text-[#0A0A0A] mb-1">操作权限</h2>
          <p className="text-xs text-[#5A5A5A] mb-4">控制页面内操作按钮的可见性</p>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#EBEBEB]">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#5A5A5A] whitespace-nowrap w-48">操作</th>
                  {roles.map(role => (
                    <th key={role.id} className="px-3 py-2 text-center text-xs font-semibold text-[#5A5A5A] whitespace-nowrap min-w-[100px]">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buttonPermissions.map(perm => (
                  <tr key={perm.id} className="border-b border-[#EBEBEB]/50 hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-sm text-[#0A0A0A]">{perm.name}</div>
                      <div className="text-xs text-[#B0B8D1] font-mono">{perm.code}</div>
                    </td>
                    {roles.map(role => (
                      <td key={`${role.id}-${perm.id}`} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={role.permissionIds?.includes(perm.id) || false}
                          onChange={() => togglePermission(role.id, perm.id, role.permissionIds?.includes(perm.id) || false)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#2D3BFF] focus:ring-[#2D3BFF]/30 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked readOnly className="w-4 h-4 rounded border-[#D1D5DB] text-[#2D3BFF]" />
          <span className="text-sm text-[#5A5A5A]">已授权</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" readOnly className="w-4 h-4 rounded border-[#D1D5DB]" />
          <span className="text-sm text-[#5A5A5A]">未授权</span>
        </div>
        <span className="text-xs text-[#B0B8D1]">点击复选框切换权限，自动保存</span>
      </div>
    </div>
  );
}
