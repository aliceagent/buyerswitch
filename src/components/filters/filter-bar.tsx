"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Corpus, FilterState, Group, QueryContext, SourceSlug } from "@/types";
import { parseUrlState, serializeUrlState, describeFilter } from "@/lib/filters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SOURCE_LABELS } from "@/lib/format";
import { useWorkspaceStore } from "@/stores/workspace";
import { DEFAULT_CMP } from "@/lib/demo";

interface FilterCtx {
  filter: FilterState;
  cmp: string[];
  warnings: string[];
  apply: (filter: FilterState, cmp: string[], mode?: "push" | "replace") => void;
  corpus: Corpus;
  ctx: QueryContext;
}

const C = createContext<FilterCtx | null>(null);
const EMPTY_GROUPS: Group[] = [];

export function useFilters(): FilterCtx {
  const v = useContext(C);
  if (!v) throw new Error("FilterProvider missing");
  return v;
}

export function FilterProvider({
  corpus,
  ctx,
  children,
}: {
  corpus: Corpus;
  ctx: QueryContext;
  children: React.ReactNode;
}) {
  const sp = useSearchParams();
  const spKey = sp.toString();
  const router = useRouter();
  const pathname = usePathname();
  const groups = useWorkspaceStore((s) => s.byUser[ctx.userId]?.groups[ctx.workspace.id] ?? EMPTY_GROUPS);
  const parsed = useMemo(() => {
    return parseUrlState(new URLSearchParams(spKey), {
      brands: new Set(corpus.brands.map((b) => b.id)),
      products: new Set(corpus.products.map((p) => p.id)),
      groups: new Set(groups.map((g) => g.id)),
      topics: new Set(corpus.topics.map((t) => t.id)),
      hierarchies: new Set(corpus.hierarchy.map((h) => h.id)),
      sources: new Set(ctx.workspace.sources),
    });
  }, [spKey, corpus, ctx.workspace.sources, groups]);

  const cmp = parsed.cmp.length ? parsed.cmp : DEFAULT_CMP;

  const apply = useCallback(
    (filter: FilterState, nextCmp: string[], mode: "push" | "replace" = "push") => {
      const params = serializeUrlState(filter, nextCmp, ctx.workspace.id);
      const url = `${pathname}?${params.toString()}`;
      if (mode === "replace") router.replace(url);
      else router.push(url);
    },
    [pathname, router, ctx.workspace.id],
  );

  const value = useMemo<FilterCtx>(
    () => ({
      filter: parsed.filter,
      cmp,
      warnings: parsed.warnings,
      apply,
      corpus,
      ctx,
    }),
    [parsed, cmp, apply, corpus, ctx],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function FilterBar({ ctx }: { ctx: QueryContext }) {
  const { filter, cmp, warnings, apply, corpus } = useFilters();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(filter);
  const chips = describeFilter(filter);

  return (
    <div className="border-b border-border bg-surface px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          className="bg-marigold text-navy hover:bg-marigold/90"
          onClick={() => {
            setDraft(filter);
            setOpen(true);
          }}
        >
          Filters
        </Button>
        {chips.map((chip) => (
          <button
            key={chip.dimension}
            type="button"
            className="rounded-full px-2 py-0.5 text-[11px]"
            style={{ background: "var(--chip-brands-bg)", color: "var(--chip-brands-fg)" }}
            onClick={() => {
              if (chip.key === "dates") return;
              const next = { ...filter };
              if (chip.key === "promotion") next.promotion = "all";
              else {
                const key = chip.key;
                if (key === "stars") next.stars = [];
                else if (key === "sources") next.sources = [];
                else if (key === "hierarchyIds") next.hierarchyIds = [];
                else if (key === "brandIds") next.brandIds = [];
                else if (key === "productIds") next.productIds = [];
                else if (key === "groupIds") next.groupIds = [];
                else if (key === "topicIds") next.topicIds = [];
              }
              apply(next, cmp);
            }}
          >
            {chip.dimension}: {chip.values.slice(0, 3).join(", ")}
            {chip.values.length > 3 ? "…" : ""}
          </button>
        ))}
        {cmp.length > 0 && (
          <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: "var(--chip-products-bg)", color: "var(--chip-products-fg)" }}>
            Compare {cmp.join(" · ")}
          </span>
        )}
      </div>
      {warnings.map((w) => (
        <p key={w} className="mt-1 text-[11px] text-[color:var(--delta-down)]">
          {w}
        </p>
      ))}
      {filter.topicIds.length > 0 && (
        <p className="mt-1 text-[11px] text-ink-muted">
          Topic filters select reviews mentioning any selected topic. Topic-specific evidence lists relevant quotes only.
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <label className="block text-[12px]">
            Hierarchy
            <select
              multiple
              className="mt-1 h-24 w-full rounded border border-border"
              value={draft.hierarchyIds}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  hierarchyIds: [...e.target.selectedOptions].map((o) => o.value),
                })
              }
            >
              {corpus.hierarchy.filter((h) => h.parentId).map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[12px]">
            Brands
            <select
              multiple
              className="mt-1 h-28 w-full rounded border border-border"
              value={draft.brandIds}
              onChange={(e) =>
                setDraft({ ...draft, brandIds: [...e.target.selectedOptions].map((o) => o.value) })
              }
            >
              {corpus.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[12px]">
            Sources (workspace boundary enforced)
            <select
              multiple
              className="mt-1 h-24 w-full rounded border border-border"
              value={draft.sources}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  sources: [...e.target.selectedOptions].map((o) => o.value as SourceSlug),
                })
              }
            >
              {ctx.workspace.sources.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <label className="text-[12px]">
              From
              <input
                type="date"
                className="ml-2 rounded border border-border px-2 py-1"
                value={draft.dateFrom}
                onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value })}
              />
            </label>
            <label className="text-[12px]">
              To
              <input
                type="date"
                className="ml-2 rounded border border-border px-2 py-1"
                value={draft.dateTo}
                onChange={(e) => setDraft({ ...draft, dateTo: e.target.value })}
              />
            </label>
          </div>
          <label className="text-[12px]">
            Stars
            <div className="mt-1 flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <label key={n} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={draft.stars.includes(n)}
                    onChange={(e) => {
                      const stars = e.target.checked ? [...draft.stars, n] : draft.stars.filter((s) => s !== n);
                      setDraft({ ...draft, stars });
                    }}
                  />
                  {n}★
                </label>
              ))}
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                setDraft({
                  hierarchyIds: [],
                  brandIds: [],
                  productIds: [],
                  groupIds: [],
                  topicIds: [],
                  sources: [],
                  stars: [],
                  promotion: "all",
                  dateFrom: ctx.workspace.dateRange.from,
                  dateTo: ctx.workspace.dateRange.to,
                })
              }
            >
              Clear
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                apply(draft, cmp, "push");
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
