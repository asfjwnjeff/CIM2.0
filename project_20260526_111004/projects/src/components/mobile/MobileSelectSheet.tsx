'use client';

import React, { useState, useMemo } from 'react';

interface SelectOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface MobileSelectSheetProps {
  open: boolean;
  title: string;
  options: SelectOption[];
  selected: string[];       // 已选中的 ID 列表
  multiSelect?: boolean;
  searchPlaceholder?: string;
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

export default function MobileSelectSheet({
  open,
  title,
  options,
  selected,
  multiSelect = true,
  searchPlaceholder = '搜索...',
  onConfirm,
  onClose,
}: MobileSelectSheetProps) {
  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selected);

  // 打开时重置为当前选中值
  React.useEffect(() => {
    if (open) {
      setTempSelected(selected);
      setSearch('');
    }
  }, [open, selected]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const kw = search.trim().toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(kw) || o.subtitle?.toLowerCase().includes(kw)
    );
  }, [options, search]);

  const toggleOption = (id: string) => {
    if (multiSelect) {
      setTempSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setTempSelected([id]);
      onConfirm([id]);
      onClose();
      return;
    }
  };

  const isSelected = (id: string) => tempSelected.includes(id);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 底部 Sheet */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg flex flex-col max-h-[70vh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#EBEBEB]">
          <button
            className="text-sm text-[#5A5A5A] font-medium active:text-[#0A0A0A]"
            onClick={onClose}
          >
            取消
          </button>
          <span className="text-sm font-semibold text-[#0A0A0A]">{title}</span>
          {multiSelect ? (
            <button
              className="text-sm text-[#2D3BFF] font-semibold active:text-[#4338CA]"
              onClick={() => { onConfirm(tempSelected); onClose(); }}
            >
              确认({tempSelected.length})
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>

        {/* 搜索框 */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full h-10 pl-9 pr-3 bg-[#F5F5F5] rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#2D3BFF]"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#999999]">无匹配结果</div>
          ) : (
            filtered.map((opt) => {
              const active = isSelected(opt.id);
              return (
                <button
                  key={opt.id}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg active:bg-[#F5F5F5] transition-colors text-left"
                  onClick={() => toggleOption(opt.id)}
                >
                  {/* 勾选框 */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      active ? 'bg-[#2D3BFF] border-[#2D3BFF]' : 'border-[#D5D5D5]'
                    }`}
                  >
                    {active && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* 文本 */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${active ? 'font-medium text-[#0A0A0A]' : 'text-[#0A0A0A]'}`}>
                      {opt.label}
                    </div>
                    {opt.subtitle && (
                      <div className="text-xs text-[#999999] truncate">{opt.subtitle}</div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
