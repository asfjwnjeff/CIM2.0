'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { getSearchItems, QUICK_ACTIONS } from '@/lib/navigation';

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const router = useRouter();
  const [pages] = useState(() => getSearchItems());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === 'K' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="全局搜索" description="搜索页面或执行快捷操作">
      <CommandInput placeholder="搜索页面..." />
      <CommandList>
        <CommandEmpty>未找到相关页面</CommandEmpty>
        <CommandGroup heading="页面导航">
          {pages.map((p) => (
            <CommandItem
              key={p.href + p.label}
              value={p.label}
              onSelect={() => {
                router.push(p.href);
                onOpenChange(false);
              }}
            >
              <span className="text-xs text-[#999999] w-16 shrink-0">{p.group}</span>
              <span>{p.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="快捷操作">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.href}
              value={action.label}
              onSelect={() => {
                router.push(action.href);
                onOpenChange(false);
              }}
            >
              <span className="text-[#2D3BFF]">{action.icon}</span>
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
