/**
 * 表单工具函数：脏检测、字数统计、表单重置等
 */

/** 简单深度相等比较（用于脏检测） */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => isEqual(item, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }
  return false;
}

/** 检测表单是否有未保存更改 */
export function isDirty<T extends Record<string, unknown>>(
  currentData: T,
  initialData: T
): boolean {
  return !isEqual(currentData, initialData);
}

/** 获取字符串字数（中文算一个字，英文单词不拆分） */
export function charCount(value: string): number {
  return value.length;
}

/** 格式化字数显示 "{current}/{max}" */
export function formatCharCount(current: number, max: number): string {
  return `${current}/${max}`;
}

/** 生成唯一ID (客户端临时ID) */
export function tempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 格式化手机号 138-8888-8888 */
export function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
}

/** 格式化金额（千分位） */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 格式化信用代码 18位分段 */
export function formatCreditCode(value: string): string {
  return value.replace(/\s/g, '').toUpperCase();
}
