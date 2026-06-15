'use client';

import React, { useState } from 'react';

interface MobileFormSectionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function MobileFormSection({
  title,
  subtitle,
  defaultExpanded = true,
  children,
}: MobileFormSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 active:bg-[#F5F5F5] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-left">
          <span className="text-sm font-semibold text-[#0A0A0A]">{title}</span>
          {subtitle && (
            <span className="text-xs text-[#999999] ml-2">{subtitle}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-[#999999] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}
