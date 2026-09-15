"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QueryContext } from "@/types";
import { query } from "@/lib/query";
import { useFilters } from "@/components/filters/filter-bar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function SearchPalette({
  open,
  onOpenChange,
  ctx,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ctx: QueryContext;
}) {
  const { filter } = useFilters();
  const [term, setTerm] = useState("");
  const [rows, setRows] = useState<ReturnType<typeof query.search>["data"] | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (!term.trim()) {
        setRows(null);
        return;
      }
      void query.ensure().then(() => {
        setRows(query.search(ctx, filter, term).data);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [open, term, ctx.userId, ctx.workspace.id, ctx.overlayRevision, filter.dateFrom, filter.dateTo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Evidence search</DialogTitle>
        </DialogHeader>
        <p className="text-[12px] text-ink-muted">Search filters evidence and term counts, not page KPIs.</p>
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Brand, product, topic, quote…" />
        {rows && (
          <div className="max-h-80 overflow-auto text-[13px]">
            <Section title="Brands">
              {rows.brands.map((b) => (
                <button key={b.id} className="block w-full text-left hover:bg-muted" type="button" onClick={() => router.push(`/dashboard?b=${b.id}`)}>
                  {b.name}
                </button>
              ))}
            </Section>
            <Section title="Products">
              {rows.products.map((p) => (
                <div key={p.id}>{p.name}</div>
              ))}
            </Section>
            <Section title="Topics">
              {rows.topics.map((t) => (
                <button key={t.id} className="block w-full text-left hover:bg-muted" type="button" onClick={() => router.push(`/topics/${t.id}`)}>
                  {t.name}
                </button>
              ))}
            </Section>
            <Section title="Quotes">
              {rows.quotes.map((q) => (
                <div key={q.quote.id} className="border-b border-border py-1">
                  {q.quote.text}
                </div>
              ))}
            </Section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <div className="text-[11px] uppercase text-ink-muted">{title}</div>
      {children}
    </div>
  );
}
