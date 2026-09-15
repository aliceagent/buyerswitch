"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/app-stores";
import { Button } from "@/components/ui/button";
import { persistStores, MARKETING_PATHS } from "@/lib/hydrate";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const marketing = MARKETING_PATHS.has(pathname);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageError = useUiStore((s) => s.storageError);
  const temporary = useUiStore((s) => s.temporarySession);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        for (const store of persistStores) {
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

  if (!ready && !marketing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted text-navy">
        Restoring this browser session…
      </div>
    );
  }

  if (storageError && !temporary && !marketing) {
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
      {ready && (temporary || error) && (
        <div className="bg-marigold px-4 py-2 text-center text-navy">
          Temporary session — changes may not persist in this browser.
        </div>
      )}
      {children}
    </>
  );
}
