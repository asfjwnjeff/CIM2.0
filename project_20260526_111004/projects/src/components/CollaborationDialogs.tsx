'use client';

import { useState, useEffect } from 'react';
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
  currentOwnerIds?: string[];
  currentCollaboratorIds?: string[];
  onConfirm: (data: CollaborationResult) => void;
}

export interface CollaborationResult {
  type: CollaborationDialogType;
  collaboratorIds?: string[];
  responsiblePersonIds?: string[];
  newResponsiblePersonId?: string;
  transferFromId?: string;
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
  currentOwnerIds = [],
  currentCollaboratorIds = [],
  onConfirm,
}: CollaborationDialogsProps) {
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
  const [transferFromId, setTransferFromId] = useState<string>('');
  const [newResponsiblePerson, setNewResponsiblePerson] = useState<string>('');
  const [transferReason, setTransferReason] = useState('');
  const [userSelectOpen, setUserSelectOpen] = useState(false);

  // 父组件通过 open prop 控制对话框打开时，Radix Dialog 的 onOpenChange 不会被触发。
  // 因此用 useEffect 监听 open prop 变化，在每次对话框打开时重置所有状态。
  useEffect(() => {
    if (open) {
      setSelectedCollaborators([...currentCollaboratorIds]);
      setSelectedPersons([]);
      setTransferFromId('');
      setNewResponsiblePerson('');
      setTransferReason('');
      setUserSelectOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    if (type === 'collaborate') {
      onConfirm({ type: 'collaborate', collaboratorIds: selectedCollaborators });
    } else if (type === 'assign') {
      if (selectedPersons.length === 0) return;
      onConfirm({ type: 'assign', responsiblePersonIds: selectedPersons });
    } else if (type === 'transfer') {
      if (!transferFromId || !newResponsiblePerson) return;
      onConfirm({ type: 'transfer', newResponsiblePersonId: newResponsiblePerson, transferFromId, reason: transferReason });
    }
    handleOpenChange(false);
  };

  const toggleCollaborator = (userId: string) => {
    setSelectedCollaborators((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAssignPerson = (userId: string) => {
    setSelectedPersons((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const currentOwners = currentOwnerIds.map((id) => getUserById(id)).filter(Boolean) as MockUser[];
  const ts = TYPE_STYLES[type];

  const dialogTitle =
    type === 'collaborate'
      ? `管理协同人 - ${customerName}`
      : type === 'assign'
      ? `添加负责人 - ${customerName}`
      : `移交负责人 - ${customerName}`;

  const dialogDescription =
    type === 'collaborate'
      ? '上方为当前协同人，下方为可编辑列表。在搜索框中添加或点击标签上的 × 移除协同人'
      : type === 'assign'
      ? '为该客户添加负责人（可多选），新负责人将追加到现有负责人列表'
      : '选择要移交的负责人，将其替换为其他用户';

  const isConfirmDisabled =
    (type === 'assign' && selectedPersons.length === 0) ||
    (type === 'transfer' && (!transferFromId || !newResponsiblePerson));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Current Owner display (assign & transfer) */}
          {(type === 'assign' || type === 'transfer') && (
            <div>
              <label className={LABEL_CLASS}>当前负责人</label>
              {currentOwners.length > 0 ? (
                <div className="space-y-2">
                  {currentOwners.map((owner) => (
                    <div key={owner.id} className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-[#EBEBEB]">
                      <UserAvatar user={owner} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-[#0A0A0A]">{owner.name}</div>
                        <div className="text-xs text-[#5A5A5A]">{owner.department}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[#999999] p-3 bg-[#FAFAFA] rounded-xl border border-[#EBEBEB]">暂无负责人</div>
              )}
            </div>
          )}

          {/* Current Collaborators display (collaborate) */}
          {type === 'collaborate' && (
            <div>
              <label className={LABEL_CLASS}>当前协同人</label>
              {currentCollaboratorIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentCollaboratorIds.map((id) => {
                    const user = getUserById(id);
                    if (!user) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F5] text-[#5A5A5A] border border-[#EBEBEB]">
                        <span className="w-4 h-4 rounded-full bg-[#999]/20 flex items-center justify-center text-[10px] font-bold">{user.name.charAt(0)}</span>
                        {user.name}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-[#999999] p-3 bg-[#FAFAFA] rounded-xl border border-[#EBEBEB]">暂无协同人</div>
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

          {/* Assign multi-select */}
          {type === 'assign' && (
            <>
              {selectedPersons.length > 0 && (
                <div>
                  <label className={LABEL_CLASS}>
                    已选负责人 ({selectedPersons.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPersons.map((id) => {
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
                            onClick={() => toggleAssignPerson(id)}
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
                <label className={LABEL_CLASS}>选择要添加的负责人</label>
                <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                  <PopoverTrigger asChild>
                    <button className={TRIGGER_CLASS}>
                      <User className="w-4 h-4 text-[#999999] shrink-0" />
                      <span className={TRIGGER_PLACEHOLDER}>搜索并选择用户（可多选）...</span>
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
                              const isSelected = selectedPersons.includes(user.id);
                              return (
                                <CommandItem
                                  key={user.id}
                                  onSelect={() => toggleAssignPerson(user.id)}
                                  className="flex items-center gap-2.5 rounded-lg aria-selected:bg-[#F5F5F5] cursor-pointer"
                                >
                                  <UserAvatar user={user} size="sm" />
                                  <div className="flex-1">
                                    <div className="text-sm text-[#0A0A0A]">{user.name}</div>
                                    <div className="text-xs text-[#5A5A5A]">{user.department}</div>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-[#0D8A5E] shrink-0" />}
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

          {/* Transfer */}
          {type === 'transfer' && (
            <>
              <div>
                <label className={LABEL_CLASS}>选择要移交的负责人</label>
                {currentOwners.length > 0 ? (
                  <div className="space-y-2">
                    {currentOwners.map((owner) => (
                      <button
                        key={owner.id}
                        type="button"
                        onClick={() => setTransferFromId(owner.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          transferFromId === owner.id
                            ? 'border-[#E8850C] bg-[#FFF4E8]'
                            : 'border-[#EBEBEB] bg-white hover:border-[#E8850C]/30'
                        }`}
                      >
                        <UserAvatar user={owner} size="sm" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#0A0A0A]">{owner.name}</div>
                          <div className="text-xs text-[#5A5A5A]">{owner.department}</div>
                        </div>
                        {transferFromId === owner.id && (
                          <Check className="w-5 h-5 text-[#E8850C] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[#999999] p-3 bg-[#FAFAFA] rounded-xl border border-[#EBEBEB]">暂无负责人</div>
                )}
              </div>

              {transferFromId && (
                <div>
                  <label className={LABEL_CLASS}>新负责人（替换 {getUserById(transferFromId)?.name}）</label>
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
                              {MOCK_USERS.filter((u) => !currentOwnerIds.includes(u.id)).map((user) => (
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
              )}
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
