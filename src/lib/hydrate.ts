import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { useViewsStore, useQaStore, useUiStore, useBillingStore, useTeamStore, useDraftStore } from "@/stores/app-stores";

export const persistStores = [
  useAuthStore,
  useWorkspaceStore,
  useViewsStore,
  useQaStore,
  useUiStore,
  useBillingStore,
  useTeamStore,
  useDraftStore,
];

export async function rehydrateStores(): Promise<void> {
  for (const store of persistStores) {
    await store.persist.rehydrate();
  }
}

export const MARKETING_PATHS = new Set(["/", "/product", "/pricing"]);
