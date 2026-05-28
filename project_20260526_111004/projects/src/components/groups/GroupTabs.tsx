'use client';

import React from 'react';
import type { GroupDefinition } from '@/lib/types';

interface GroupTabsProps {
  groups: GroupDefinition[];
  activeGroupId: string;
  onSelect: (id: string) => void;
  onManage: () => void;
  compact?: boolean;
}

export default function GroupTabs({ groups, activeGroupId, onSelect, onManage, compact }: GroupTabsProps) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
      {groups.map(group => (
        <button
          key={group.id}
          onClick={() => onSelect(group.id)}
          className={`relative shrink-0 px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap
            ${activeGroupId === group.id
              ? 'text-[#2D3BFF]'
              : 'text-[#666666] hover:text-[#0A0A0A]'
            }`}
        >
          {group.name}
          {activeGroupId === group.id && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#2D3BFF] rounded-full" />
          )}
        </button>
      ))}
      <button
        onClick={onManage}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded text-[#999999] hover:text-[#2D3BFF] hover:bg-[#E8EBFF] transition-colors ml-1"
        title="分组管理"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
