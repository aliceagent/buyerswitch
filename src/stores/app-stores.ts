"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FilterState, Sentiment } from "@/types";

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  cmp: string[];
  mode: "unique" | "all";
  datasetVersion: string;
  workspaceId: string;
  watch?: boolean;
}

interface ViewsState {
  byUser: Record<string, Record<string, SavedView[]>>;
  ensureDefaults: (userId: string, workspaceId: string, defaults: SavedView[]) => void;
  save: (userId: string, workspaceId: string, view: SavedView) => void;
  remove: (userId: string, workspaceId: string, id: string) => void;
  rename: (userId: string, workspaceId: string, id: string, name: string) => void;
}

export const useViewsStore = create<ViewsState>()(
  persist(
    (set, get) => ({
      byUser: {},
      ensureDefaults: (userId, workspaceId, defaults) => {
        const user = get().byUser[userId] ?? {};
        if (user[workspaceId]?.length) return;
        set({ byUser: { ...get().byUser, [userId]: { ...user, [workspaceId]: defaults } } });
      },
      save: (userId, workspaceId, view) => {
        const user = get().byUser[userId] ?? {};
        const list = [...(user[workspaceId] ?? []).filter((v) => v.id !== view.id), view];
        set({ byUser: { ...get().byUser, [userId]: { ...user, [workspaceId]: list } } });
      },
      remove: (userId, workspaceId, id) => {
        const user = get().byUser[userId] ?? {};
        set({
          byUser: {
            ...get().byUser,
            [userId]: { ...user, [workspaceId]: (user[workspaceId] ?? []).filter((v) => v.id !== id) },
          },
        });
      },
      rename: (userId, workspaceId, id, name) => {
        const user = get().byUser[userId] ?? {};
        set({
          byUser: {
            ...get().byUser,
            [userId]: {
              ...user,
              [workspaceId]: (user[workspaceId] ?? []).map((v) => (v.id === id ? { ...v, name } : v)),
            },
          },
        });
      },
    }),
    { name: "bs.views", version: 2, skipHydration: true, storage: createJSONStorage(() => localStorage) },
  ),
);

export interface QaEvent {
  id: string;
  quoteId: string;
  userId: string;
  workspaceId: string;
  before: { topicId?: string; sentiment?: Sentiment };
  after: { topicId?: string; sentiment?: Sentiment; flag?: boolean; approved?: boolean };
  reason: string;
  at: string;
  version: number;
}

interface QaState {
  byUser: Record<
    string,
    Record<
      string,
      {
        overrides: Record<string, { topicId?: string; sentiment?: Sentiment }>;
        events: QaEvent[];
        flags: string[];
        approved: string[];
        revision: number;
      }
    >
  >;
  ensure: (userId: string, workspaceId: string) => void;
  apply: (userId: string, workspaceId: string, event: Omit<QaEvent, "id" | "at" | "version">) => void;
  undo: (userId: string, workspaceId: string) => void;
}

export const useQaStore = create<QaState>()(
  persist(
    (set, get) => ({
      byUser: {},
      ensure: (userId, workspaceId) => {
        const user = get().byUser[userId] ?? {};
        if (user[workspaceId]) return;
        set({
          byUser: {
            ...get().byUser,
            [userId]: {
              ...user,
              [workspaceId]: { overrides: {}, events: [], flags: [], approved: [], revision: 0 },
            },
          },
        });
      },
      apply: (userId, workspaceId, event) => {
        const user = get().byUser[userId] ?? {};
        const cur = user[workspaceId] ?? { overrides: {}, events: [], flags: [], approved: [], revision: 0 };
        const full: QaEvent = {
          ...event,
          id: `qa-${cur.revision + 1}`,
          at: new Date().toISOString(),
          version: cur.revision + 1,
        };
        const overrides = { ...cur.overrides };
        if (event.after.topicId || event.after.sentiment) {
          overrides[event.quoteId] = {
            topicId: event.after.topicId,
            sentiment: event.after.sentiment,
          };
        }
        const flags = event.after.flag
          ? [...new Set([...cur.flags, event.quoteId])]
          : cur.flags.filter((id) => id !== event.quoteId);
        const approved = event.after.approved
          ? [...new Set([...cur.approved, event.quoteId])]
          : cur.approved;
        set({
          byUser: {
            ...get().byUser,
            [userId]: {
              ...user,
              [workspaceId]: {
                overrides,
                events: [...cur.events, full],
                flags,
                approved,
                revision: cur.revision + 1,
              },
            },
          },
        });
      },
      undo: (userId, workspaceId) => {
        const user = get().byUser[userId] ?? {};
        const cur = user[workspaceId];
        if (!cur || !cur.events.length) return;
        const last = cur.events[cur.events.length - 1]!;
        const reverse: QaEvent = {
          id: `qa-${cur.revision + 1}`,
          quoteId: last.quoteId,
          userId,
          workspaceId,
          before: last.after,
          after: last.before,
          reason: "undo",
          at: new Date().toISOString(),
          version: cur.revision + 1,
        };
        const overrides = { ...cur.overrides };
        if (last.before.topicId || last.before.sentiment) {
          overrides[last.quoteId] = last.before;
        } else {
          delete overrides[last.quoteId];
        }
        set({
          byUser: {
            ...get().byUser,
            [userId]: {
              ...user,
              [workspaceId]: {
                ...cur,
                overrides,
                events: [...cur.events, reverse],
                revision: cur.revision + 1,
              },
            },
          },
        });
      },
    }),
    { name: "bs.qa", version: 2, skipHydration: true, storage: createJSONStorage(() => localStorage) },
  ),
);

interface UiState {
  density: "comfortable" | "compact";
  reducedMotion: boolean;
  sentimentAbsolute: boolean;
  fastMode: boolean;
  theme: "light" | "dark";
  storageError: string | null;
  temporarySession: boolean;
  setDensity: (d: UiState["density"]) => void;
  setFastMode: (v: boolean) => void;
  setSentimentAbsolute: (v: boolean) => void;
  setStorageError: (v: string | null) => void;
  setTemporary: (v: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      density: "comfortable",
      reducedMotion: false,
      sentimentAbsolute: false,
      fastMode: true,
      theme: "light",
      storageError: null,
      temporarySession: false,
      setDensity: (density) => set({ density }),
      setFastMode: (fastMode) => set({ fastMode }),
      setSentimentAbsolute: (sentimentAbsolute) => set({ sentimentAbsolute }),
      setStorageError: (storageError) => set({ storageError }),
      setTemporary: (temporarySession) => set({ temporarySession }),
    }),
    { name: "bs.ui", version: 2, skipHydration: true, storage: createJSONStorage(() => localStorage) },
  ),
);

interface BillingState {
  byUser: Record<string, { plan: "starter" | "growth" | "enterprise"; interval: "month" | "year"; previewStatus: "saved" | "skipped" | null }>;
  save: (userId: string, plan: "starter" | "growth" | "enterprise", interval: "month" | "year") => void;
  skip: (userId: string) => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      byUser: {},
      save: (userId, plan, interval) =>
        set({ byUser: { ...get().byUser, [userId]: { plan, interval, previewStatus: "saved" } } }),
      skip: (userId) =>
        set({
          byUser: {
            ...get().byUser,
            [userId]: { plan: "starter", interval: "month", previewStatus: "skipped" },
          },
        }),
    }),
    { name: "bs.billing", version: 2, skipHydration: true, storage: createJSONStorage(() => localStorage) },
  ),
);

export interface Teammate {
  id: string;
  name: string;
  email: string;
  role: "viewer" | "analyst" | "admin";
}

interface TeamState {
  byUser: Record<string, Record<string, Teammate[]>>;
  ensure: (userId: string, workspaceId: string, seed: Teammate[]) => void;
  add: (userId: string, workspaceId: string, mate: Teammate) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      byUser: {},
      ensure: (userId, workspaceId, seed) => {
        const user = get().byUser[userId] ?? {};
        if (user[workspaceId]) return;
        set({ byUser: { ...get().byUser, [userId]: { ...user, [workspaceId]: seed } } });
      },
      add: (userId, workspaceId, mate) => {
        const user = get().byUser[userId] ?? {};
        const list = [...(user[workspaceId] ?? []), mate];
        set({ byUser: { ...get().byUser, [userId]: { ...user, [workspaceId]: list } } });
      },
    }),
    { name: "bs.team", version: 2, skipHydration: true, storage: createJSONStorage(() => localStorage) },
  ),
);

interface DraftState {
  byUser: Record<string, Record<string, { hypothesis: string; ownerRole: string; test: string; successMetric: string }>>;
  save: (userId: string, findingId: string, draft: DraftState["byUser"][string][string]) => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      byUser: {},
      save: (userId, findingId, draft) => {
        const user = get().byUser[userId] ?? {};
        set({ byUser: { ...get().byUser, [userId]: { ...user, [findingId]: draft } } });
      },
    }),
    { name: "bs.drafts", version: 2, skipHydration: true, storage: createJSONStorage(() => localStorage) },
  ),
);
