"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { useViewsStore, useQaStore, useUiStore, useBillingStore, useTeamStore, useDraftStore } from "@/stores/app-stores";
import { Button } from "@/components/ui/button";

const stores = [
  useAuthStore,
  useWorkspaceStore,
  useViewsStore,
  useQaStore,
  useUiStore,
  useBillingStore,
  useTeamStore,
  useDraftStore,
];

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageError = useUiStore((s) => s.storageError);
  const temporary = useUiStore((s) => s.temporarySession);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        for (const store of stores) {
          await store.persist.rehydrate();
        }
        if (!cancelled) setReady(true);
      } catch (e) {
        useUiStore.getState().setStorageError("Browser storage is unavailable or corrupt.");
        useUiStore.getState().setTemporary(true);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "storage error");
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted text-navy">
        Restoring this browser session…
      </div>
    );
  }

  if (storageError && !temporary) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <h1 className="text-xl font-semibold text-navy">Storage problem</h1>
        <p className="mt-2 text-ink-muted">{storageError}</p>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              localStorage.clear();
              location.reload();
            }}
          >
            Reset BuyerSwitch storage
          </Button>
          <Button variant="outline" onClick={() => useUiStore.getState().setTemporary(true)}>
            Continue with a temporary session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {(temporary || error) && (
        <div className="bg-marigold px-4 py-2 text-center text-navy">
          Temporary session — changes may not persist in this browser.
        </div>
      )}
      {children}
    </>
  );
}
