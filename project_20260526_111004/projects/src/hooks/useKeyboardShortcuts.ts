'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutDef {
  key: string;
  /** 需要同时按下的修饰键 */
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  handler: () => void;
  /** 是否仅在未聚焦输入框时触发 */
  ignoreInput?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutDef[];
  /** 是否启用（可用于弹窗关闭时禁用全局快捷键） */
  enabled?: boolean;
}

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * 全局键盘快捷键 Hook
 * 支持 Cmd/Ctrl 组合键，自动忽略输入框内的按键
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const { key, ctrl, meta, shift, preventDefault = true, handler, ignoreInput = true } = shortcut;

        const keyMatch = e.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : true;
        const metaMatch = meta ? e.metaKey : true;
        const shiftMatch = shift ? e.shiftKey : !e.shiftKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
          // 忽略输入框内的快捷键（除非显式关闭）
          if (ignoreInput) {
            const target = e.target as HTMLElement;
            if (INPUT_TAGS.has(target.tagName) || target.isContentEditable) {
              return;
            }
          }

          if (preventDefault) {
            e.preventDefault();
            e.stopPropagation();
          }
          handler();
          return;
        }
      }
    },
    [shortcuts, enabled],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
