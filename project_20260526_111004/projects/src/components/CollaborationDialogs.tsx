'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ChevronsUpDown, Check, User } from 'lucide-react';
import { MOCK_USERS, type MockUser } from '@/lib/sample-data';

export type CollaborationDialogType = 'collaborate' | 'assign' | 'transfer';

interface CollaborationDialogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CollaborationDialogType;
  customerName: string;
  currentOwnerId?: string;
  currentCollaboratorIds?: string[];
  onConfirm: (data: CollaborationResult) => void;
}

export interface CollaborationResult {
  type: CollaborationDialogType;
  collaboratorIds?: string[];
  responsiblePersonIds?: string[];
  newResponsiblePersonId?: string;
  reason?: string;
}

function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

function UserAvatar({ user, size }: { user: MockUser; size?: 'sm' | 'md' }) {
  const initial = user.name.charAt(0);
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-[#2D3BFF] text-white flex items-center justify-center font-medium shrink-0`}>
      {initial}
    </div>
  );
}

const TYPE_STYLES: Record<CollaborationDialogType, { icon: string; color: string; bg: string; border: string; hoverBg: string; confirmBg: string; confirmHover: string }> = {
  collaborate: {
    icon: 'text-[#2D3BFF]',
    color: 'text-[#2D3BFF]',
    bg: 'bg-[#E8EBFF]',
    border: 'border-[#C7CCFF]',
    hoverBg: 'hover:bg-[#D8DCFF]',
    confirmBg: 'bg-[#2D3BFF]',
    confirmHover: 'hover:bg-[#4338CA]',
  },
  assign: {
    icon: 'text-[#0D8A5E]',
    color: 'text-[#0D8A5E]',
    bg: 'bg-[#E6F7F0]',
    border: 'border-[#B8E8D4]',
    hoverBg: 'hover:bg-[#D0F0E4]',
    confirmBg: 'bg-[#0D8A5E]',
    confirmHover: 'hover:bg-[#0A7A4E]',
  },
  transfer: {
    icon: 'text-[#E8850C]',
    color: 'text-[#E8850C]',
    bg: 'bg-[#FFF4E8]',
    border: 'border-[#FFE0B2]',
    hoverBg: 'hover:bg-[#FFECD0]',
    confirmBg: 'bg-[#E8850C]',
    confirmHover: 'hover:bg-[#D4780A]',
  },
};

const LABEL_CLASS = 'text-[13px] font-medium text-[#0A0A0A] mb-1.5 block';
const TRIGGER_CLASS = 'w-full h-[38px] flex items-center gap-2 px-3 border border-[#D5D5D5] rounded-lg text-sm hover:border-[#2D3BFF] transition-colors bg-white';
const TRIGGER_PLACEHOLDER = 'text-[#999999] font-light';

export function CollaborationDialogs({
  open,
  onOpenChange,
  type,
  customerName,
  currentOwnerId,
  currentCollaboratorIds = [],
  onConfirm,
}: CollaborationDialogsProps) {
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(currentCollaboratorIds);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [newResponsiblePerson, setNewResponsiblePerson] = useState<string>('');
  const [transferReason, setTransferReason] = useState('');
  const [userSelectOpen, setUserSelectOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedCollaborators(currentCollaboratorIds);
      setSelectedPerson('');
      setNewResponsiblePerson('');
      setTransferReason('');
      setUserSelectOpen(false);
    }
    onOpenChange(open);
  };

  const handleConfirm = () => {
    if (type === 'collaborate') {
      onConfirm({ type: 'collaborate', collaboratorIds: selectedCollaborators });
    } else if (type === 'assign') {
      if (!selectedPerson) return;
      onConfirm({ type: 'assign', responsiblePersonIds: [selectedPerson] });
    } else if (type === 'transfer') {
      if (!newResponsiblePerson) return;
      onConfirm({ type: 'transfer', newResponsiblePersonId: newResponsiblePerson, reason: transferReason });
    }
    handleOpenChange(false);
  };

  const toggleCollaborator = (userId: string) => {
    setSelectedCollaborators((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const currentOwner = currentOwnerId ? getUserById(currentOwnerId) : undefined;
  const ts = TYPE_STYLES[type];

  const dialogTitle =
    type === 'collaborate'
      ? `添加协同人 - ${customerName}`
      : type === 'assign'
      ? `设置负责人 - ${customerName}`
      : `移交负责人 - ${customerName}`;

  const isConfirmDisabled =
    (type === 'assign' && !selectedPerson) ||
    (type === 'transfer' && !newResponsiblePerson);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {type === 'collaborate' && '选择协同人，他们将获得该客户的查看和编辑权限'}
            {type === 'assign' && '为该客户分配负责人'}
            {type === 'transfer' && '将负责人职责移交给其他用户，原负责人将自动变为协同人'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Current Owner display (assign & transfer) */}
          {(type === 'assign' || type === 'transfer') && (
            <div>
              <label className={LABEL_CLASS}>当前负责人</label>
              {currentOwner ? (
                <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-[#EBEBEB]">
                  <UserAvatar user={currentOwner} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-[#0A0A0A]">{currentOwner.name}</div>
                    <div className="text-xs text-[#5A5A5A]">{currentOwner.department}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[#999999] p-3 bg-[#FAFAFA] rounded-xl border border-[#EBEBEB]">暂无负责人</div>
              )}
            </div>
          )}

          {/* Collaborators multi-select */}
          {type === 'collaborate' && (
            <>
              {selectedCollaborators.length > 0 && (
                <div>
                  <label className={LABEL_CLASS}>
                    已选协同人 ({selectedCollaborators.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCollaborators.map((id) => {
                      const user = getUserById(id);
                      if (!user) return null;
                      return (
                        <span
                          key={id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ts.bg} ${ts.color} border ${ts.border}`}
                        >
                          <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">
                            {user.name.charAt(0)}
                          </span>
                          {user.name}
                          <button
                            type="button"
                            onClick={() => toggleCollaborator(id)}
                            className={`ml-0.5 rounded-full p-0.5 ${ts.hoverBg} transition-colors`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className={LABEL_CLASS}>选择协同人</label>
                <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                  <PopoverTrigger asChild>
                    <button className={TRIGGER_CLASS}>
                      <User className="w-4 h-4 text-[#999999] shrink-0" />
                      <span className={TRIGGER_PLACEHOLDER}>搜索并选择用户...</span>
                      <ChevronsUpDown className="w-4 h-4 ml-auto opacity-40 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl border-[#EBEBEB] shadow-[0_4px_16px_rgba(0,0,0,0.08)]" align="start">
                    <Command>
                      <CommandInput placeholder="搜索用户名..." />
                      <CommandList>
                        <CommandEmpty>未找到用户</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-48">
                            {MOCK_USERS.map((user) => {
                              const isSelected = selectedCollaborators.includes(user.id);
                              return (
                                <CommandItem
                                  key={user.id}
                                  onSelect={() => toggleCollaborator(user.id)}
                                  className="flex items-center gap-2.5 rounded-lg aria-selected:bg-[#F5F5F5] cursor-pointer"
                                >
                                  <UserAvatar user={user} size="sm" />
                                  <div className="flex-1">
                                    <div className="text-sm text-[#0A0A0A]">{user.name}</div>
                                    <div className="text-xs text-[#5A5A5A]">{user.department}</div>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-[#2D3BFF] shrink-0" />}
                                </CommandItem>
                              );
                            })}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {/* Assign single select */}
          {type === 'assign' && (
            <div>
              <label className={LABEL_CLASS}>新负责人</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={TRIGGER_CLASS}>
                    {selectedPerson ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={getUserById(selectedPerson)!} size="sm" />
                        <span className="text-sm text-[#0A0A0A]">{getUserById(selectedPerson)?.name}</span>
                      </div>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-[#999999] shrink-0" />
                        <span className={TRIGGER_PLACEHOLDER}>选择负责人...</span>
                      </>
                    )}
                    <ChevronsUpDown className="w-4 h-4 ml-auto opacity-40 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl border-[#EBEBEB] shadow-[0_4px_16px_rgba(0,0,0,0.08)]" align="start">
                  <Command>
                    <CommandInput placeholder="搜索用户名..." />
                    <CommandList>
                      <CommandEmpty>未找到用户</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-48">
                          {MOCK_USERS.map((user) => (
                            <CommandItem
                              key={user.id}
                              onSelect={() => setSelectedPerson(user.id)}
                              className="flex items-center gap-2.5 rounded-lg aria-selected:bg-[#F5F5F5] cursor-pointer"
                            >
                              <UserAvatar user={user} size="sm" />
                              <div className="flex-1">
                                <div className="text-sm text-[#0A0A0A]">{user.name}</div>
                                <div className="text-xs text-[#5A5A5A]">{user.department}</div>
                              </div>
                              {selectedPerson === user.id && <Check className="w-4 h-4 text-[#0D8A5E] shrink-0" />}
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Transfer */}
          {type === 'transfer' && (
            <>
              <div>
                <label className={LABEL_CLASS}>新负责人</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={TRIGGER_CLASS}>
                      {newResponsiblePerson ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar user={getUserById(newResponsiblePerson)!} size="sm" />
                          <span className="text-sm text-[#0A0A0A]">{getUserById(newResponsiblePerson)?.name}</span>
                        </div>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-[#999999] shrink-0" />
                          <span className={TRIGGER_PLACEHOLDER}>选择新负责人...</span>
                        </>
                      )}
                      <ChevronsUpDown className="w-4 h-4 ml-auto opacity-40 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl border-[#EBEBEB] shadow-[0_4px_16px_rgba(0,0,0,0.08)]" align="start">
                    <Command>
                      <CommandInput placeholder="搜索用户名..." />
                      <CommandList>
                        <CommandEmpty>未找到用户</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-48">
                            {MOCK_USERS.filter((u) => u.id !== currentOwnerId).map((user) => (
                              <CommandItem
                                key={user.id}
                                onSelect={() => setNewResponsiblePerson(user.id)}
                                className="flex items-center gap-2.5 rounded-lg aria-selected:bg-[#F5F5F5] cursor-pointer"
                              >
                                <UserAvatar user={user} size="sm" />
                                <div className="flex-1">
                                  <div className="text-sm text-[#0A0A0A]">{user.name}</div>
                                  <div className="text-xs text-[#5A5A5A]">{user.department}</div>
                                </div>
                                {newResponsiblePerson === user.id && <Check className="w-4 h-4 text-[#E8850C] shrink-0" />}
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className={LABEL_CLASS}>移交原因（可选）</label>
                <Textarea
                  placeholder="请输入移交原因..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={2}
                  className="resize-none border-[#D5D5D5] rounded-lg text-sm placeholder:text-[#999999] placeholder:font-light focus:border-[#E8850C] focus:shadow-[0_0_0_2px_rgba(232,133,12,0.10)]"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="inline-flex items-center justify-center h-[38px] px-4 border border-[#D5D5D5] text-[#0A0A0A] rounded-lg text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`inline-flex items-center justify-center h-[38px] px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ts.confirmBg} ${ts.confirmHover}`}
          >
            确认
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
