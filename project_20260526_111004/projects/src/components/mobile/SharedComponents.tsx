'use client';

import React from 'react';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#EBEBEB]">
        <h3 className="text-sm font-semibold text-[#0A0A0A]">{title}</h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-1.5 text-sm">
      <span className="text-[#999999] shrink-0 mr-3">{label}</span>
      <span className="text-[#0A0A0A] text-right">{value}</span>
    </div>
  );
}

export function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return (
    <div data-error={error ? 'true' : undefined}>
      <label className={`text-sm font-medium block mb-1.5 ${error ? 'text-[#D63031]' : 'text-[#0A0A0A]'}`}>
        {label}{required && <span className="text-[#D63031] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#D63031] mt-1">请填写{label}</p>}
    </div>
  );
}
