import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 根据 ID 列表解析业务主客户名称
 */
export function resolveBusinessCustomerNames(
  ids: string[],
  customers: { id: string; name: string }[]
): string[] {
  if (!ids || ids.length === 0) return [];
  return ids.map((id) => {
    const customer = customers.find((c) => c.id === id);
    return customer ? customer.name : `未知(${id})`;
  });
}

/**
 * 根据 ID 列表解析开票信息名称
 */
export function resolveInvoiceInfoNames(
  ids: string[],
  invoices: { id: string; title: string }[]
): string[] {
  if (!ids || ids.length === 0) return [];
  return ids.map((id) => {
    const invoice = invoices.find((inv) => inv.id === id);
    return invoice ? invoice.title : `未知(${id})`;
  });
}
