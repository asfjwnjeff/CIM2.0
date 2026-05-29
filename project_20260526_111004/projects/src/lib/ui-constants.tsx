import React from 'react';

/** 通用表单字段样式 */
export const FIELD_STYLES = {
  /** 字段标签: 14px / semibold / #0A0A0A */
  label: 'block text-sm font-semibold text-[#0A0A0A] mb-1.5',
  /** 文本输入框: 38px高 / 8px圆角 / 1px细边框 */
  input:
    'w-full h-[38px] px-3 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] placeholder:font-light focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)] transition-colors',
  /** 下拉触发器（SearchableSelect / SearchableMultiSelect 共用） */
  selectTrigger:
    'w-full h-[38px] flex items-center gap-2 px-3 border border-[#D5D5D5] rounded-lg text-sm hover:border-[#2D3BFF] transition-colors bg-white',
  /** 下拉触发器占位色 */
  selectTriggerPlaceholder: 'text-[#999999] font-light',
  /** 多行文本域 */
  textarea:
    'w-full min-h-[80px] px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] placeholder:font-light focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)] transition-colors resize-y',
  /** 必填星号 */
  requiredStar: React.createElement('span', { className: 'text-[#D63031] ml-0.5' }, '*'),
} as const;

/** 品牌色 */
export const BRAND_COLORS = {
  primary: '#2D3BFF',
  primaryHover: '#4338CA',
  primaryLight: '#E8EBFF',
} as const;

/** 功能色 */
export const SEMANTIC_COLORS = {
  success: '#0D8A5E',
  successLight: '#E6F7F0',
  warning: '#E8850C',
  warningLight: '#FFF4E8',
  error: '#D63031',
  errorLight: '#FFEBEE',
  info: '#2D3BFF',
} as const;

/** 中性色 */
export const NEUTRAL_COLORS = {
  textPrimary: '#0A0A0A',
  textSecondary: '#5A5A5A',
  textTertiary: '#999999',
  textPlaceholder: '#999999',
  border: '#D5D5D5',
  borderLight: '#EBEBEB',
  bgPage: '#FAFAFA',
  bgSurface: '#FFFFFF',
  bgHover: '#F5F5F5',
} as const;

/** 排版 */
export const TYPOGRAPHY = {
  pageTitle: 'text-xl font-bold text-[#0A0A0A]',
  sectionTitle: 'text-md font-semibold text-[#0A0A0A]',
  body: 'text-sm text-[#0A0A0A]',
  caption: 'text-xs text-[#5A5A5A]',
  label: 'text-xs text-[#5A5A5A]',
} as const;

/** 阴影 */
export const SHADOWS = {
  xs: '0 1px 2px rgba(0,0,0,0.04)',
  sm: '0 2px 8px rgba(0,0,0,0.06)',
  md: '0 4px 16px rgba(0,0,0,0.08)',
  lg: '0 8px 32px rgba(0,0,0,0.12)',
} as const;

/** 圆角 */
export const RADIUS = {
  sm: '6px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

/** 服务产品选项（全站统一） */
export const SERVICE_PRODUCT_OPTIONS = [
  '货代', '关务', '仓库', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他',
] as const;

/** 服务产品 → 颜色映射（用于标签/徽章） */
export const SERVICE_PRODUCT_COLORS: Record<string, { bg: string; text: string }> = {
  '货代': { bg: '#E8F4FF', text: '#2D3BFF' },
  '关务': { bg: '#E6F7F0', text: '#0D8A5E' },
  '仓库': { bg: '#FFF4E8', text: '#E8850C' },
  '运输': { bg: '#F3E8FF', text: '#7C3AED' },
  '进出口': { bg: '#FCE7F3', text: '#DB2777' },
  '维修': { bg: '#E8F4FF', text: '#0369A1' },
  '合同物流': { bg: '#F0FDF4', text: '#16A34A' },
  '一体化供应链': { bg: '#FFF7ED', text: '#EA580C' },
  '其他': { bg: '#F5F5F5', text: '#5A5A5A' },
};
