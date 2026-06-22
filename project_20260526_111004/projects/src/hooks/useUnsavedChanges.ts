'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesOptions {
  /** 是否有未保存的更改 */
  isDirty: boolean;
  /** 自定义确认消息（浏览器原生弹窗仅支持通用提示） */
  message?: string;
  /** 路由切换时的自定义确认回调，返回 true 表示允许离开 */
  onBeforeLeave?: () => boolean;
  /** 自定义确认函数（如 useConfirm().confirm），替代 window.confirm。不传则使用原生 confirm 作为兜底 */
  confirmFn?: (title: string, message: string) => Promise<boolean>;
}

/**
 * 未保存更改保护 Hook
 * - 浏览器刷新/关闭时触发 beforeunload 原生对话框
 * - 通过 onBeforeLeave 回调拦截路由切换
 */
export function useUnsavedChanges({
  isDirty,
  message = '你有未保存的更改，确定离开吗？',
  onBeforeLeave,
  confirmFn,
}: UseUnsavedChangesOptions) {
  const router = useRouter();
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const onBeforeLeaveRef = useRef(onBeforeLeave);
  onBeforeLeaveRef.current = onBeforeLeave;

  const confirmFnRef = useRef(confirmFn);
  confirmFnRef.current = confirmFn;

  // 浏览器刷新/关闭拦截
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [message]);

  // 提供手动确认函数供路由拦截使用
  const confirmLeave = useCallback((): boolean => {
    if (!isDirtyRef.current) return true;
    if (onBeforeLeaveRef.current) {
      return onBeforeLeaveRef.current();
    }
    if (confirmFnRef.current) {
      // 异步确认：通过同步抛出的方式无法拦截，此处返回 false 由调用方通过 Promise 处理
      // 实际使用中调用方应先 await confirmFn 再决定是否离开
      return false;
    }
    return window.confirm(message);
  }, [message]);

  return { confirmLeave, isDirty };
}
