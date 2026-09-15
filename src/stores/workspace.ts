"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Group, Market, ReviewMode, SourceSlug, Workspace } from "@/types";
import { DEFAULT_WORKSPACE } from "@/lib/defaults";
export { DEFAULT_WORKSPACE };

interface WorkspaceState {
  version: number;
  byUser: Record<
    string,
    {
      workspaces: Workspace[];
      activeId: string | null;
      groups: Record<string, Group[]>;
    }
  >;
  ensureUser: (userId: string, seedGroups: Group[]) => void;
  setActive: (userId: string, id: string | null) => void;
  upsertWorkspace: (userId: string, ws: Workspace) => void;
  deleteWorkspace: (userId: string, id: string) => void;
  setGroups: (userId: string, workspaceId: string, groups: Group[]) => void;
  updateWorkspace: (userId: string, id: string, patch: Partial<Workspace>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      version: 2,
      byUser: {},
      ensureUser: (userId, seedGroups) => {
        const cur = get().byUser[userId];
        if (cur?.workspaces.length) return;
        set({
          byUser: {
            ...get().byUser,
            [userId]: {
              workspaces: [{ ...DEFAULT_WORKSPACE }],
              activeId: DEFAULT_WORKSPACE.id,
              groups: { [DEFAULT_WORKSPACE.id]: seedGroups },
            },
          },
        });
      },
      setActive: (userId, id) => {
        const cur = get().byUser[userId];
        if (!cur) return;
        set({ byUser: { ...get().byUser, [userId]: { ...cur, activeId: id } } });
      },
      upsertWorkspace: (userId, ws) => {
        const cur = get().byUser[userId] ?? { workspaces: [], activeId: null, groups: {} };
        const workspaces = [...cur.workspaces.filter((w) => w.id !== ws.id), ws];
        set({
          byUser: {
            ...get().byUser,
            [userId]: { ...cur, workspaces, activeId: ws.id, groups: { ...cur.groups, [ws.id]: cur.groups[ws.id] ?? [] } },
          },
        });
      },
      deleteWorkspace: (userId, id) => {
        const cur = get().byUser[userId];
        if (!cur) return;
        const workspaces = cur.workspaces.filter((w) => w.id !== id);
        const groups = { ...cur.groups };
        delete groups[id];
        const activeId = cur.activeId === id ? workspaces[0]?.id ?? null : cur.activeId;
        set({ byUser: { ...get().byUser, [userId]: { ...cur, workspaces, groups, activeId } } });
      },
      setGroups: (userId, workspaceId, groups) => {
        const cur = get().byUser[userId];
        if (!cur) return;
        set({ byUser: { ...get().byUser, [userId]: { ...cur, groups: { ...cur.groups, [workspaceId]: groups } } } });
      },
      updateWorkspace: (userId, id, patch) => {
        const cur = get().byUser[userId];
        if (!cur) return;
        set({
          byUser: {
            ...get().byUser,
            [userId]: {
              ...cur,
              workspaces: cur.workspaces.map((w) => (w.id === id ? { ...w, ...patch } : w)),
            },
          },
        });
      },
    }),
    { name: "bs.workspace", version: 2, skipHydration: true, storage: createJSONStorage(() => localStorage) },
  ),
);

export type { Market, ReviewMode, SourceSlug };
