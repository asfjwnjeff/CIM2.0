'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { GroupCondition, GroupDefinition, GroupFieldMeta } from '@/lib/types';
import {
  type ModuleKey,
  createSystemGroups,
  loadGroupConfig,
  saveGroupConfig,
  applyGroupFilter,
} from '@/lib/group-utils';

interface UseGroupFilterOptions {
  moduleKey: ModuleKey;
  currentUserId: string;
}

interface UseGroupFilterReturn<T> {
  groups: GroupDefinition[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  activeGroup: GroupDefinition | null;
  dialogOpen: boolean;
  editingGroup: GroupDefinition | null;
  openCreateDialog: () => void;
  openEditDialog: (group: GroupDefinition) => void;
  closeDialog: () => void;
  createGroup: (name: string, conditions: GroupCondition[]) => void;
  updateGroup: (id: string, name: string, conditions: GroupCondition[]) => void;
  deleteGroup: (id: string) => void;
  applyFilter: (items: T[]) => T[];
}

export function useGroupFilter<T>(
  options: UseGroupFilterOptions,
): UseGroupFilterReturn<T> {
  const { moduleKey, currentUserId } = options;

  const systemGroups = useMemo(
    () => createSystemGroups(moduleKey, currentUserId),
    [moduleKey, currentUserId],
  );

  const [customGroups, setCustomGroups] = useState<GroupDefinition[]>(() => {
    const config = loadGroupConfig(moduleKey);
    return config.groups;
  });

  const [activeGroupId, setActiveGroupIdState] = useState<string>(() => {
    const config = loadGroupConfig(moduleKey);
    return config.activeGroupId || 'sys-all';
  });

  const groups = useMemo(() => {
    const all = [...systemGroups, ...customGroups];
    all.sort((a, b) => a.sortOrder - b.sortOrder);
    return all;
  }, [systemGroups, customGroups]);

  const activeGroup = useMemo(
    () => groups.find(g => g.id === activeGroupId) ?? groups[0] ?? null,
    [groups, activeGroupId],
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupDefinition | null>(null);

  const openCreateDialog = useCallback(() => {
    setEditingGroup(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((group: GroupDefinition) => {
    setEditingGroup(group);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingGroup(null);
  }, []);

  const prevCustomGroupsRef = useRef<string>('');
  useEffect(() => {
    const serialized = JSON.stringify(customGroups);
    if (serialized !== prevCustomGroupsRef.current) {
      prevCustomGroupsRef.current = serialized;
      saveGroupConfig(moduleKey, { groups: customGroups, activeGroupId });
    }
  }, [customGroups, activeGroupId, moduleKey]);

  useEffect(() => {
    saveGroupConfig(moduleKey, { groups: customGroups, activeGroupId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId]);

  const setActiveGroupId = useCallback((id: string) => {
    setActiveGroupIdState(id);
  }, []);

  const createGroup = useCallback((name: string, conditions: GroupCondition[]) => {
    const maxOrder = Math.max(0, ...customGroups.map(g => g.sortOrder));
    const newGroup: GroupDefinition = {
      id: `custom-${Date.now()}`,
      name,
      isSystem: false,
      conditions,
      sortOrder: maxOrder + 1,
    };
    setCustomGroups(prev => [...prev, newGroup]);
    setActiveGroupIdState(newGroup.id);
  }, [customGroups]);

  const updateGroup = useCallback((id: string, name: string, conditions: GroupCondition[]) => {
    setCustomGroups(prev =>
      prev.map(g => (g.id === id ? { ...g, name, conditions } : g)),
    );
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setCustomGroups(prev => prev.filter(g => g.id !== id));
    setActiveGroupIdState(prev => (prev === id ? 'sys-all' : prev));
  }, []);

  const applyFilter = useCallback(
    (items: T[]): T[] => {
      if (!activeGroup || activeGroup.conditions.length === 0) return items;
      return applyGroupFilter(items, activeGroup.conditions);
    },
    [activeGroup],
  );

  return {
    groups,
    activeGroupId,
    setActiveGroupId,
    activeGroup,
    dialogOpen,
    editingGroup,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    createGroup,
    updateGroup,
    deleteGroup,
    applyFilter,
  };
}
