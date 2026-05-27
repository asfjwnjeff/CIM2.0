import React from 'react';

interface FormSectionProps {
  /** Section 标题 */
  title?: string;
  /** 标题右侧的附加操作 */
  action?: React.ReactNode;
  /** 是否显示标题底部的分割线 */
  divider?: boolean;
  /** 子元素：字段行 */
  children: React.ReactNode;
  className?: string;
}

/**
 * 表单分区包装组件
 * 白色卡片包裹一组逻辑相关的字段
 */
export function FormSection({
  title,
  action,
  divider = true,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <div className={`bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${className}`}>
      {title && (
        <>
          <div className="flex items-center justify-between px-5 pt-5 pb-0">
            <h3 className="text-md font-semibold text-[#0A0A0A]">{title}</h3>
            {action && <div>{action}</div>}
          </div>
          {divider && <div className="mx-5 mt-4 border-t border-[#EBEBEB]" />}
        </>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
