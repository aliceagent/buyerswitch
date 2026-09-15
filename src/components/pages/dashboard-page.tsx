"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { query } from "@/lib/query";
import { DemoGate } from "@/components/layout/demo-gate";
import { useFilters } from "@/components/filters/filter-bar";
import { KpiStrip, WidgetCard } from "@/components/widgets/kpi-strip";
import { DataTable } from "@/components/widgets/data-table";
import { formatMetric, formatPercent } from "@/lib/format";
import { sentimentBucket, SENTIMENT_COLORS_LIGHT } from "@/lib/chart-colors";
import { useUiStore } from "@/stores/app-stores";
import type { EntityKind, EntityRow, Grain, QueryContext } from "@/types";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  return (
    <DemoGate>
      {({ ctx }) => <DashboardInner ctx={ctx} />}
    </DemoGate>
  );
}

function DashboardInner({ ctx }: { ctx: QueryContext }) {
  const { filter, cmp, apply } = useFilters();
  const [kind, setKind] = useState<EntityKind>("brand");
  const [kpis, setKpis] = useState<ReturnType<typeof query.getKpis>["data"] | null>(null);
  const [rows, setRows] = useState<EntityRow[]>([]);
  const [series, setSeries] = useState<ReturnType<typeof query.getSeries>["data"]>([]);
  const [stars, setStars] = useState<ReturnType<typeof query.getStarBreakdown>["data"] | null>(null);
  const [grain, setGrain] = useState<Grain>("month");
  const [metric, setMetric] = useState<"volume" | "sentiment">("volume");
  const absolute = useUiStore((s) => s.sentimentAbsolute);

  useEffect(() => {
    let live = true;
    void query.ensure().then(() => {
      if (!live) return;
      setKpis(query.getKpis(ctx, filter).data);
      setRows(query.getEntities(ctx, filter, kind).data);
      setSeries(query.getSeries(ctx, filter, grain).data);
      setStars(query.getStarBreakdown(ctx, filter).data);
    });
    return () => {
      live = false;
    };
  }, [ctx, filter, kind, grain]);

  const avg = kpis?.sentiment.value ?? 70;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-navy">Dashboard</h1>
      {kpis && (
        <KpiStrip
          items={[
            { label: "Reviews in scope", metric: kpis.reviews },
            { label: "Opinions in matching reviews", metric: kpis.quotes, hint: filter.topicIds.length ? "Opinions in matching reviews, not topic-only quotes." : undefined },
            { label: "Positive opinion share", metric: kpis.sentiment },
            { label: "Average stars", metric: kpis.avgStars },
          ]}
          footer={`Workspace totals: ${kpis.workspaceTotals.reviews} reviews · ${kpis.workspaceTotals.quotes} opinions in the selected source boundary.`}
        />
      )}
      <WidgetCard
        title="Volume over time"
        menu={
          <div className="flex gap-2">
            <select value={grain} onChange={(e) => setGrain(e.target.value as Grain)} className="rounded border border-border text-[12px]">
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
            <select value={metric} onChange={(e) => setMetric(e.target.value as "volume" | "sentiment")} className="rounded border border-border text-[12px]">
              <option value="volume">Volume</option>
              <option value="sentiment">Positive share</option>
            </select>
          </div>
        }
      >
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={series.map((p) => ({ ...p, y: metric === "volume" ? p.volume : p.sentiment ?? 0 }))}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="y" radius={[4, 4, 0, 0]}>
                {series.map((p) => {
                  const bucket = p.sentiment === null ? 3 : sentimentBucket(p.sentiment, avg, absolute);
                  return <Cell key={p.period} fill={SENTIMENT_COLORS_LIGHT[bucket]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">
          Shaded relative to this view&apos;s average of {avg.toFixed(0)}%. Empty bins show volume 0 and no sentiment line.
        </p>
        <details className="mt-2 text-[12px]">
          <summary>Table alternative</summary>
          <table className="w-full">
            <thead>
              <tr>
                <th>Period</th>
                <th>Volume</th>
                <th>Positive share</th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.period}>
                  <td>{p.period}</td>
                  <td className="tabular">{p.volume}</td>
                  <td className="tabular">{p.sentiment === null ? "No data" : formatPercent(p.sentiment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </WidgetCard>
      {stars && (
        <WidgetCard title="Star mix">
          <div className="flex gap-4">
            {stars.levels.map((l) => (
              <button
                key={l.stars}
                type="button"
                className="rounded border border-border px-3 py-2"
                onClick={() => apply({ ...filter, stars: [l.stars] }, cmp)}
              >
                <div>{l.stars}★</div>
                <div className="tabular">{l.count}</div>
                <div className="text-[11px] text-ink-muted">{l.share.toFixed(1)}%</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px]">Average {formatMetric(stars.average)}. Shares may round; raw counts sum to the KPI review total.</p>
        </WidgetCard>
      )}
      <WidgetCard
        title="Entities"
        menu={
          <div className="flex gap-1">
            {(["brand", "product", "group", "hierarchy"] as const).map((k) => (
              <Button key={k} size="xs" variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>
                {k}
              </Button>
            ))}
          </div>
        }
      >
        {kind === "group" ? (
          <p className="mb-2 text-[12px] text-ink-muted">Groups are overlapping unions of listings and cannot be summed.</p>
        ) : null}
        <DataTable
          rows={rows}
          columns={[
            { id: "name", header: "Name", sortValue: (r) => r.name, cell: (r) => r.name },
            { id: "reviews", header: "Reviews", sortValue: (r) => r.metrics.reviews.value, cell: (r) => formatMetric(r.metrics.reviews) },
            { id: "pos", header: "Positive share", sortValue: (r) => r.metrics.sentiment.value, cell: (r) => formatMetric(r.metrics.sentiment) },
            { id: "stars", header: "Stars", sortValue: (r) => r.metrics.avgStars.value, cell: (r) => formatMetric(r.metrics.avgStars) },
            {
              id: "act",
              header: "",
              cell: (r) => (
                <Link className="text-lightblue" href={`/comparison?cmp=${kindPrefix(kind)}${r.id}`}>
                  Compare
                </Link>
              ),
            },
          ]}
          total={rows.length}
          page={1}
          pageSize={rows.length || 1}
          onPage={() => undefined}
          empty="No entities in this scope."
        />
      </WidgetCard>
    </div>
  );
}

function kindPrefix(kind: EntityKind): string {
  if (kind === "brand") return "b:";
  if (kind === "product") return "p:";
  if (kind === "group") return "g:";
  return "h:";
}
