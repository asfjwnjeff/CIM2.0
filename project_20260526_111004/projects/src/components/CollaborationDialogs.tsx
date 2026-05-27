'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#1A2FFF] to-[#3B52FF] text-white flex items-center justify-center font-medium shrink-0`}>
      {initial}
    </div>
  );
}

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
      // Reset state
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
      <DialogContent className="sm:max-w-md">
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
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">当前负责人</label>
              {currentOwner ? (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <UserAvatar user={currentOwner} size="sm" />
                  <div>
                    <div className="text-sm font-medium">{currentOwner.name}</div>
                    <div className="text-xs text-gray-500">{currentOwner.department}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400 p-2 bg-gray-50 rounded-lg">暂无负责人</div>
              )}
            </div>
          )}

          {/* Collaborators multi-select */}
          {type === 'collaborate' && (
            <>
              {/* Current collaborators */}
              {selectedCollaborators.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    已选协同人 ({selectedCollaborators.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCollaborators.map((id) => {
                      const user = getUserById(id);
                      if (!user) return null;
                      return (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          <UserAvatar user={user} size="sm" />
                          <span className="text-xs">{user.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleCollaborator(id)}
                            className="ml-0.5 rounded-full hover:bg-gray-300 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* User search/select */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">选择协同人</label>
                <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" size="sm">
                      <span className="text-gray-500">搜索并选择用户...</span>
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                                  className="flex items-center gap-2"
                                >
                                  <UserAvatar user={user} size="sm" />
                                  <div className="flex-1">
                                    <div className="text-sm">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.department}</div>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-[#1A2FFF]" />}
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
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">新负责人</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" size="sm">
                    {selectedPerson ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar user={getUserById(selectedPerson)!} size="sm" />
                        <span>{getUserById(selectedPerson)?.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">选择负责人...</span>
                    )}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                              className="flex items-center gap-2"
                            >
                              <UserAvatar user={user} size="sm" />
                              <div className="flex-1">
                                <div className="text-sm">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.department}</div>
                              </div>
                              {selectedPerson === user.id && <Check className="w-4 h-4 text-[#1A2FFF]" />}
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
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">新负责人</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" size="sm">
                      {newResponsiblePerson ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar user={getUserById(newResponsiblePerson)!} size="sm" />
                          <span>{getUserById(newResponsiblePerson)?.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">选择新负责人...</span>
                      )}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                                className="flex items-center gap-2"
                              >
                                <UserAvatar user={user} size="sm" />
                                <div className="flex-1">
                                  <div className="text-sm">{user.name}</div>
                                  <div className="text-xs text-gray-500">{user.department}</div>
                                </div>
                                {newResponsiblePerson === user.id && <Check className="w-4 h-4 text-[#1A2FFF]" />}
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
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">移交原因（可选）</label>
                <Textarea
                  placeholder="请输入移交原因..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirmDisabled} className="bg-[#1A2FFF] hover:bg-[#1524CC]">
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
