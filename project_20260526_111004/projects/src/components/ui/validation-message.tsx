import React from 'react';

interface ValidationMessageProps {
  /** 错误文字数组，为空时不显示 */
  errors?: string[];
  /** 成功信息（极少使用） */
  success?: string;
  className?: string;
}

/**
 * 表单验证提示组件
 * 用于在字段下方显示错误或成功提示
 */
export function ValidationMessage({ errors, success, className = '' }: ValidationMessageProps) {
  if (errors && errors.length > 0) {
    return (
      <div className={`mt-1 ${className}`}>
        {errors.map((msg, i) => (
          <p key={i} className="text-xs text-[#D63031] leading-tight flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {msg}
          </p>
        ))}
      </div>
    );
  }

  if (success) {
    return (
      <p className={`mt-1 text-xs text-[#0D8A5E] leading-tight flex items-center gap-1 ${className}`}>
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {success}
      </p>
    );
  }

  return null;
}
