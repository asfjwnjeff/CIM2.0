'use client';

import { useCallback } from 'react';
import { useApp } from '@/lib/store';

/**
 * 权限检查 Hook
 * 从 Store 读取当前用户的权限码集合，提供 can/canAny/canAll 方法
 */
export function usePermission() {
  const { permissionCodes } = useApp();

  /** 检查是否有某个权限 */
  const can = useCallback(
    (code: string): boolean => {
      return permissionCodes.has(code);
    },
    [permissionCodes]
  );

  /** 检查是否有一组权限中的任意一个 */
  const canAny = useCallback(
    (...codes: string[]): boolean => {
      return codes.some(c => permissionCodes.has(c));
    },
    [permissionCodes]
  );

  /** 检查是否有一组权限的全部 */
  const canAll = useCallback(
    (...codes: string[]): boolean => {
      return codes.every(c => permissionCodes.has(c));
    },
    [permissionCodes]
  );

  return { can, canAny, canAll, permissionCodes };
}

/**
 * 权限守卫组件
 * 用法: <PermissionGuard code="customers:create">新增按钮</PermissionGuard>
 */
export function PermissionGuard({
  code,
  codes,
  mode = 'any',
  fallback = null,
  children,
}: {
  code?: string;
  codes?: string[];
  mode?: 'all' | 'any';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { can, canAny, canAll } = usePermission();

  if (code && !can(code)) return <>{fallback}</>;
  if (codes && mode === 'all' && !canAll(...codes)) return <>{fallback}</>;
  if (codes && mode === 'any' && !canAny(...codes)) return <>{fallback}</>;

  return <>{children}</>;
}
