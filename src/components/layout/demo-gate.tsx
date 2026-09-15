"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Corpus, QueryContext } from "@/types";
import { ensureWorkspace, seedDemoProfile, useCorpus, useQueryContext } from "@/lib/demo";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorState, LoadingState } from "@/components/brand/primitives";
import { useAuthStore } from "@/stores/auth";
import { FilterProvider } from "@/components/filters/filter-bar";

const APP_PREFIXES = [
  "/dashboard",
  "/topics",
  "/comparison",
  "/switch-radar",
  "/star-rating",
  "/products",
  "/reviews",
  "/settings",
];

export function DemoGate({
  children,
  print = false,
}: {
  children: (args: { corpus: Corpus; ctx: QueryContext }) => React.ReactNode;
  print?: boolean;
}) {
  const { corpus, error, retry, loading } = useCorpus();
  const selected = useAuthStore((s) => s.selectedProfileId);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const spKey = sp.toString();

  useEffect(() => {
    if (corpus && !selected) {
      const returnTo = `${pathname}${spKey ? `?${spKey}` : ""}`;
      if (APP_PREFIXES.some((p) => pathname.startsWith(p))) {
        const safe = pathname.startsWith("/") && !pathname.startsWith("//") ? returnTo : "/dashboard";
        router.replace(`/login?returnTo=${encodeURIComponent(safe)}`);
      }
    }
  }, [corpus, selected, pathname, router, spKey]);

  const ensured = useRef(false);
  useEffect(() => {
    if (corpus && selected && !ensured.current) {
      ensured.current = true;
      ensureWorkspace(selected, corpus);
    }
  }, [corpus, selected]);

  const ctx = useQueryContext(corpus);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState title="Could not load synthetic corpus" body={error} onRetry={retry} />;
  if (!corpus) return <LoadingState />;
  if (!selected) return <LoadingState label="Redirecting to profile selection…" />;
  if (!ctx) return <LoadingState label="Preparing workspace…" />;

  return (
    <FilterProvider corpus={corpus} ctx={ctx}>
      <AppShell ctx={ctx} print={print}>
        {children({ corpus, ctx })}
      </AppShell>
    </FilterProvider>
  );
}

export function ReadyButton() {
  const { corpus, error, retry, loading } = useCorpus();
  const router = useRouter();
  if (loading) return <LoadingState />;
  if (error || !corpus) return <ErrorState title="Corpus unavailable" body={error ?? ""} onRetry={retry} />;
  return (
    <button
      type="button"
      className="rounded bg-lightblue px-4 py-2 text-white"
      onClick={() => {
        seedDemoProfile(corpus);
        router.push("/switch-radar?h=wireless-earphones&cmp=b:tozo,b:apple,b:sony,b:jlab,b:jabra&v=2&w=ws-audio-us-ca");
      }}
    >
      Open Switch Radar
    </button>
  );
}
