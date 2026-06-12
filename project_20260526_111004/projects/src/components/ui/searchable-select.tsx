'use client';

import { useState, ReactNode } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface SearchableSelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  renderOption?: (option: SelectOption<T>) => ReactNode;
  renderTrigger?: (option: SelectOption<T> | undefined) => ReactNode;
}

export function SearchableSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = '请选择',
  searchPlaceholder = '搜索...',
  emptyText = '无匹配选项',
  disabled = false,
  className = '',
  renderOption,
  renderTrigger,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const triggerClasses = [
    'w-full h-[38px] flex items-center gap-2 px-3',
    'border border-[#D5D5D5] rounded-lg text-sm bg-white',
    'justify-between hover:border-[#2D3BFF] transition-colors',
    !selected ? 'text-[#999999] font-light' : 'text-[#0A0A0A]',
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
          {renderTrigger ? (
            renderTrigger(selected)
          ) : (
            <>
              <span className="flex-1 text-left">{selected ? selected.label : placeholder}</span>
              <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#EBEBEB] p-0"
        align="start"
      >
        <Command>
          <div className="border-b border-[#EBEBEB] px-3 py-2">
            <CommandInput placeholder={searchPlaceholder} className="border-0 p-0 h-auto" />
          </div>
          <CommandList>
            <CommandEmpty className="text-[#999999] text-sm py-6">{emptyText}</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[280px]">
                {options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <CommandItem
                      key={String(option.value)}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2 h-[38px] px-3 ${
                        isSelected ? 'bg-[#E8EBFF]' : 'hover:bg-[#F5F5F5]'
                      }`}
                    >
                      {renderOption ? (
                        renderOption(option)
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
