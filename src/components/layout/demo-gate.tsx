"use client";

import { useEffect, useRef } from "react";
import type { Corpus, QueryContext } from "@/types";
import { ensureWorkspace, seedDemoProfile, useCorpus, useQueryContext } from "@/lib/demo";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorState, LoadingState } from "@/components/brand/primitives";
import { useAuthStore } from "@/stores/auth";
import { FilterProvider } from "@/components/filters/filter-bar";

export function DemoGate({
  children,
  print = false,
}: {
  children: (args: { corpus: Corpus; ctx: QueryContext }) => React.ReactNode;
  print?: boolean;
}) {
  const { corpus, error, retry, loading } = useCorpus();
  const selected = useAuthStore((s) => s.selectedProfileId);

  useEffect(() => {
    if (corpus && !selected) {
      seedDemoProfile(corpus);
    }
  }, [corpus, selected]);

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
  if (!selected) return <LoadingState label="Opening the demo scenario…" />;
  if (!ctx) return <LoadingState label="Preparing workspace…" />;

  return (
    <FilterProvider corpus={corpus} ctx={ctx}>
      <AppShell ctx={ctx} print={print}>
        {children({ corpus, ctx })}
      </AppShell>
    </FilterProvider>
  );
}
