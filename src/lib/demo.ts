"use client";

import { useEffect, useMemo, useState } from "react";
import { loadCorpus, resetQueryLoad } from "@/lib/query";
import { RADAR_SCENARIO_HREF } from "@/lib/scenario";
import type { Corpus, FilterState, QueryContext, Workspace } from "@/types";
import { useAuthStore, ALEX } from "@/stores/auth";
import { DEFAULT_WORKSPACE, useWorkspaceStore } from "@/stores/workspace";
import { useQaStore, useTeamStore, useViewsStore, type SavedView } from "@/stores/app-stores";
import { VISIBLE_FROM, VISIBLE_TO } from "@/lib/dates";
import { MEGA_TOPICS } from "@/lib/taxonomy";
import { clearQueryCache } from "@/lib/query";

export const DEFAULT_CMP = ["b:tozo", "b:apple", "b:sony", "b:jlab", "b:jabra"];

export function defaultViews(workspaceId: string, datasetVersion: string): SavedView[] {
  const base: FilterState = {
    hierarchyIds: ["wireless-earphones"],
    brandIds: [],
    productIds: [],
    groupIds: [],
    topicIds: [],
    sources: [],
    stars: [],
    promotion: "all",
    dateFrom: VISIBLE_FROM,
    dateTo: VISIBLE_TO,
  };
  return [
    {
      id: "view-tozo-exposure",
      name: "TOZO competitive exposure",
      filters: base,
      cmp: DEFAULT_CMP,
      mode: "unique",
      datasetVersion,
      workspaceId,
    },
    {
      id: "view-recovery",
      name: "TOZO recovery window",
      filters: { ...base, dateFrom: "2021-01-01", dateTo: "2021-06-30" },
      cmp: DEFAULT_CMP,
      mode: "unique",
      datasetVersion,
      workspaceId,
    },
    {
      id: "view-low-support",
      name: "Low-support slice",
      filters: {
        ...base,
        dateFrom: "2021-10-20",
        dateTo: "2021-10-31",
        sources: ["target"],
        topicIds: ["smell"],
        brandIds: ["tozo"],
      },
      cmp: ["b:tozo", "b:apple"],
      mode: "unique",
      datasetVersion,
      workspaceId,
    },
    {
      id: "view-oct-ergonomics",
      name: "October TOZO Ergonomics",
      filters: {
        ...base,
        dateFrom: "2021-10-01",
        dateTo: "2021-10-31",
        brandIds: ["tozo"],
        topicIds: ["ergonomics"],
      },
      cmp: DEFAULT_CMP,
      mode: "unique",
      datasetVersion,
      workspaceId,
    },
  ];
}

export function ensureWorkspace(userId: string, corpus: Corpus): void {
  useWorkspaceStore.getState().ensureUser(userId, corpus.seedGroups);
  const ws = useWorkspaceStore.getState().byUser[userId];
  const wsId = ws?.activeId ?? DEFAULT_WORKSPACE.id;
  useViewsStore.getState().ensureDefaults(userId, wsId, defaultViews(wsId, corpus.manifest.datasetVersion));
  useQaStore.getState().ensure(userId, wsId);
  useTeamStore.getState().ensure(userId, wsId, [
    { id: "self", name: "You", email: "demo@example.com", role: "admin" },
  ]);
}

export function seedDemoProfile(corpus: Corpus): void {
  const auth = useAuthStore.getState();
  if (!auth.profiles.some((p) => p.id === ALEX.id)) auth.upsertProfile(ALEX);
  auth.setSelected(ALEX.id);
  auth.markOnboarding(ALEX.id, "profile");
  auth.markOnboarding(ALEX.id, "workspace");
  auth.markOnboarding(ALEX.id, "explore");
  ensureWorkspace(ALEX.id, corpus);
}

export function useCorpus(): {
  corpus: Corpus | null;
  error: string | null;
  retry: () => void;
  loading: boolean;
} {
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    loadCorpus()
      .then((c) => {
        if (live) {
          setError(null);
          setCorpus(c);
        }
      })
      .catch((e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : "Load failed");
      });
    return () => {
      live = false;
    };
  }, [tick]);
  return {
    corpus,
    error,
    loading: !corpus && !error,
    retry: () => {
      resetQueryLoad();
      setCorpus(null);
      setTick((t) => t + 1);
    },
  };
}

export function useQueryContext(corpus: Corpus | null): QueryContext | null {
  const userId = useAuthStore((s) => s.selectedProfileId);
  const wsState = useWorkspaceStore((s) => (userId ? s.byUser[userId] : undefined));
  const qa = useQaStore((s) => (userId && wsState?.activeId ? s.byUser[userId]?.[wsState.activeId] : undefined));
  return useMemo(() => {
    if (!corpus || !userId || !wsState?.activeId) return null;
    const workspace: Workspace = wsState.workspaces.find((w) => w.id === wsState.activeId) ?? DEFAULT_WORKSPACE;
    const groups = wsState.groups[workspace.id] ?? corpus.seedGroups;
    return {
      userId,
      workspace,
      datasetVersion: corpus.manifest.datasetVersion,
      overlayRevision: qa?.revision ?? 0,
      groups,
      megaTopics: MEGA_TOPICS,
      taxonomy: { renames: {}, mergedInto: {}, suppressed: [] },
      qaOverrides: qa?.overrides ?? {},
    };
  }, [corpus, userId, wsState, qa]);
}

export function onContextChange(): void {
  clearQueryCache();
}

export async function openDemoScenario(): Promise<string> {
  const { rehydrateStores } = await import("@/lib/hydrate");
  await rehydrateStores();
  const corpus = await loadCorpus();
  seedDemoProfile(corpus);
  return RADAR_SCENARIO_HREF;
}
