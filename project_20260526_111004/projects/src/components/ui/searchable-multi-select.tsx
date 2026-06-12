'use client';

import { useState, ReactNode } from 'react';
import { ChevronsUpDown, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SelectOption } from './searchable-select';

interface SearchableMultiSelectProps<T = string> {
  values: T[];
  onChange: (values: T[]) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  renderOption?: (option: SelectOption<T>, isSelected: boolean) => ReactNode;
  renderBadge?: (option: SelectOption<T>, onRemove: () => void) => ReactNode;
}

export function SearchableMultiSelect<T extends string = string>({
  values,
  onChange,
  options,
  placeholder = '请选择',
  searchPlaceholder = '搜索...',
  emptyText = '无匹配选项',
  disabled = false,
  className = '',
  renderOption,
  renderBadge,
}: SearchableMultiSelectProps<T>) {
  const [open, setOpen] = useState(false);

  const toggleOption = (val: T) => {
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val]);
  };

  const selectedOptions = options.filter((o) => values.includes(o.value));

  const triggerClasses = [
    'w-full min-h-[38px] h-auto flex items-center gap-2 px-3',
    'border border-[#D5D5D5] rounded-lg text-sm bg-white',
    'justify-between hover:border-[#2D3BFF] transition-colors',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={triggerClasses}
        >
          {values.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 py-1.5">
              {selectedOptions.map((option) => {
                if (renderBadge) {
                  return renderBadge(option, () => toggleOption(option.value));
                }
                return (
                  <span
                    key={String(option.value)}
                    className="inline-flex items-center gap-1 bg-[#E8EBFF] text-[#2D3BFF] rounded-md text-xs font-medium px-2 py-0.5"
                  >
                    <span>{option.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(option.value);
                      }}
                      className="rounded-full hover:bg-[#2D3BFF]/20 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="flex-1 text-left text-[#999999] font-light">{placeholder}</span>
          )}
          <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#EBEBEB] p-0"
        align="start"
      >
        {values.length > 0 && (
          <div className="bg-[#FAFAFA] border-b border-[#EBEBEB] px-3 py-2 text-xs text-[#5A5A5A]">
            已选择 {values.length} 项
          </div>
        )}
        <Command>
          <div className="border-b border-[#EBEBEB] px-3 py-2">
            <CommandInput placeholder={searchPlaceholder} className="border-0 p-0 h-auto" />
          </div>
          <CommandList>
            <CommandEmpty className="text-[#999999] text-sm py-6">{emptyText}</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[280px]">
                {options.map((option) => {
                  const isSelected = values.includes(option.value);
                  return (
                    <CommandItem
                      key={String(option.value)}
                      onSelect={() => toggleOption(option.value)}
                      className={`flex items-center gap-2 h-[38px] px-3 ${
                        isSelected ? 'bg-[#E8EBFF]' : 'hover:bg-[#F5F5F5]'
                      }`}
                    >
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <span className="text-sm flex-1">{option.label}</span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#2D3BFF] shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
