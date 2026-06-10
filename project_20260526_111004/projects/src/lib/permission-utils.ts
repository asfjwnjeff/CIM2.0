import type { TokenPayload } from './auth';
import type { Permission } from './types';

/**
 * 权限计算工具函数
 */

/** 根据权限列表获取用户可访问的菜单路径 */
export function getAccessiblePaths(permissions: Permission[]): Set<string> {
  const paths = new Set<string>();
  for (const perm of permissions) {
    if (perm.type === 'menu' && perm.path && perm.status === 'active') {
      paths.add(perm.path);
    }
  }
  return paths;
}

/** 根据权限列表获取用户的权限码集合 */
export function getPermissionCodes(permissions: Permission[]): Set<string> {
  return new Set(
    permissions
      .filter(p => p.status === 'active')
      .map(p => p.code)
  );
}

/** 检查用户是否有某个权限码 */
export function hasPermission(codes: Set<string>, code: string): boolean {
  return codes.has(code);
}

/** 检查用户是否有一组权限中的任意一个 */
export function hasAnyPermission(codes: Set<string>, ...checkCodes: string[]): boolean {
  return checkCodes.some(c => codes.has(c));
}

/** 检查用户是否有一组权限的全部 */
export function hasAllPermissions(codes: Set<string>, ...checkCodes: string[]): boolean {
  return checkCodes.every(c => codes.has(c));
}

/** 获取用户可见的客户 ID 列表（基于负责人/协同人 + 数据权限配置） */
export function getVisibleCustomerIds(
  userId: string,
  userRoleIds: string[],
  userDepartment: string | undefined,
  customerOwnerMap: Map<string, { responsiblePersons: string[]; collaborators: string[] }>,
  dataPermissions: { dimension: string; targetId: string; customerIds: string[] }[],
): Set<string> {
  // 管理员跳过过滤
  if (userRoleIds.includes('role-admin')) {
    return new Set(customerOwnerMap.keys());
  }

  const visibleIds = new Set<string>();

  // 1. 数据权限配置：用户角色维度
  for (const dp of dataPermissions) {
    if (dp.dimension === 'role' && userRoleIds.includes(dp.targetId)) {
      dp.customerIds.forEach(id => visibleIds.add(id));
    }
    if (dp.dimension === 'user' && dp.targetId === userId) {
      dp.customerIds.forEach(id => visibleIds.add(id));
    }
    if (dp.dimension === 'department' && userDepartment && dp.targetId === userDepartment) {
      dp.customerIds.forEach(id => visibleIds.add(id));
    }
  }

  // 2. 负责人/协同人机制
  for (const [customerId, data] of customerOwnerMap) {
    if (data.responsiblePersons.includes(userId) || data.collaborators.includes(userId)) {
      visibleIds.add(customerId);
    }
  }

  return visibleIds;
}

/** 获取用户信息（从 TokenPayload 转换） */
export function getUserFromPayload(payload: TokenPayload) {
  return {
    id: payload.userId,
    name: payload.realName,
    username: payload.username,
    realName: payload.realName,
    email: '',
    role: payload.roleIds[0] || '',
    roleIds: payload.roleIds,
    department: payload.department,
  };
}
