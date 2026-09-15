"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { query } from "@/lib/query";
import { DemoGate } from "@/components/layout/demo-gate";
import { useFilters } from "@/components/filters/filter-bar";
import { KpiStrip, WidgetCard } from "@/components/widgets/kpi-strip";
import { EmptyState, LoadingState } from "@/components/brand/primitives";
import { formatPercent, SOURCE_LABELS } from "@/lib/format";
import { ENTITY_COLORS_LIGHT, INDUSTRY_COLOR } from "@/lib/chart-colors";
import { useDraftStore, useViewsStore } from "@/stores/app-stores";
import type { QueryContext, RadarFinding, TopicRow } from "@/types";
import { Button } from "@/components/ui/button";
import { exportExcel } from "@/lib/excel-export";
import { exportPptx } from "@/lib/pptx-export";

export function TopicsPage() {
  return <DemoGate>{({ ctx }) => <TopicsInner ctx={ctx} />}</DemoGate>;
}

function TopicsInner({ ctx }: { ctx: QueryContext }) {
  const { filter, cmp, apply } = useFilters();
  const [rows, setRows] = useState<TopicRow[]>([]);
  const [sum, setSum] = useState<ReturnType<typeof query.getTopicSummaries>["data"] | null>(null);
  useEffect(() => {
    void query.ensure().then(() => {
      setRows(query.getTopics(ctx, filter).data);
      setSum(query.getTopicSummaries(ctx, filter).data);
    });
  }, [ctx, filter]);
  const leaves = rows.filter((r) => !r.isMega && r.topicId !== "hidden-topics");
  const chart = [...leaves].sort((a, b) => (b.mentionShare ?? 0) - (a.mentionShare ?? 0)).slice(0, 20);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-navy">Topics</h1>
      <p className="text-[12px] text-ink-muted">% of reviews mentioning topic. Shares overlap and do not sum to 100%.</p>
      {sum && (
        <div className="grid gap-3 md:grid-cols-3">
          <SummaryCard title="Most discussed" row={sum.mostDiscussed} />
          <SummaryCard title="Most positive (supported)" row={sum.mostPositive} />
          <SummaryCard title="Most negative (supported)" row={sum.mostNegative} />
        </div>
      )}
      <div className="space-y-1 overflow-x-auto rounded-lg border border-border bg-surface p-3">
        {chart.map((r) => (
          <button
            key={r.topicId}
            type="button"
            className="flex w-full items-center gap-3 text-left"
            onClick={() => apply({ ...filter, topicIds: [r.topicId] }, cmp)}
          >
            <span className="w-40 shrink-0 truncate text-[12px] text-ink">{r.name}</span>
            <span className="relative h-3 min-w-[200px] flex-1 rounded bg-muted">
              <span
                className="absolute inset-y-0 left-0 rounded bg-lightblue"
                style={{ width: `${Math.min(100, r.mentionShare ?? 0)}%` }}
              />
            </span>
            <span className="w-16 shrink-0 text-right text-[12px] tabular text-ink-muted">
              {formatPercent(r.mentionShare)}
            </span>
          </button>
        ))}
      </div>
      <ul className="columns-2 text-[13px] md:columns-3">
        {leaves.map((r) => (
          <li key={r.topicId} className="mb-1 break-inside-avoid">
            <Link className="text-lightblue" href={`/topics/${r.topicId}`}>
              {r.name}
            </Link>{" "}
            <span className="tabular text-ink-muted">
              {formatPercent(r.mentionShare)} · n={r.distinctReviewN}
              {r.support !== "sufficient" ? " · Insufficient evidence" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryCard({ title, row }: { title: string; row: TopicRow | null }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-[12px] text-ink-muted">{title}</div>
      <div className="font-medium">{row?.name ?? "No supported finding"}</div>
    </div>
  );
}

export function TopicDetailPage() {
  return <DemoGate>{({ ctx }) => <TopicDetailInner ctx={ctx} />}</DemoGate>;
}

function TopicDetailInner({ ctx }: { ctx: QueryContext }) {
  const params = useParams<{ topicId: string }>();
  const topicId = params.topicId;
  const { filter } = useFilters();
  const [detail, setDetail] = useState<ReturnType<typeof query.getTopicDetail>["data"] | null>(null);
  const [quotes, setQuotes] = useState<ReturnType<typeof query.getQuotes>["data"] | null>(null);
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    void query.ensure().then(() => {
      setDetail(query.getTopicDetail(ctx, filter, topicId).data);
      setQuotes(query.getQuotes(ctx, { ...filter, topicIds: [topicId] }, { page, pageSize: 20, topicId, term: term || undefined }).data);
    });
  }, [ctx, filter, topicId, page, term]);
  if (!detail) return null;
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-ink-muted">
        Route topic {detail.topic.name} replaces any conflicting global topic selection for this page.
      </p>
      <h1 className="text-xl font-semibold text-navy">{detail.topic.name}</h1>
      <KpiStrip
        items={[
          { label: "Reviews mentioning topic", metric: { ...detail.matchingKpis.reviews, unit: "count", goodDirection: "neutral", deltaKind: "absolute" } },
          { label: "Opinions in matching reviews", metric: detail.matchingKpis.quotes, hint: "All opinions in reviews that mention this topic." },
          { label: "Topic positive share", metric: { value: detail.topic.sentiment, delta: null, deltaKind: "points", unit: "percent", goodDirection: "up" } },
          { label: "Average stars (matching reviews)", metric: detail.matchingKpis.avgStars },
        ]}
      />
      <label className="text-[12px]">
        Evidence search
        <input className="ml-2 rounded border border-border px-2 py-1" value={term} onChange={(e) => { setTerm(e.target.value); setPage(1); }} />
      </label>
      <div className="space-y-3">
        {quotes?.rows.map((row) => (
          <article key={row.quote.id} className="rounded-lg border border-border bg-surface p-3">
            <div className="text-[11px] text-ink-muted">
              Illustrative review · Synthetic text · {SOURCE_LABELS[row.review.source]} · {row.review.stars}★ · {row.review.postDate}
            </div>
            <p className="mt-1 whitespace-pre-wrap">
              {row.review.text.slice(0, row.quote.charStart)}
              <mark className="bg-marigold/40">{row.review.text.slice(row.quote.charStart, row.quote.charEnd)}</mark>
              {row.review.text.slice(row.quote.charEnd)}
            </p>
          </article>
        ))}
      </div>
      <div className="flex gap-2 text-[12px]">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
        <span>
          {quotes?.page} / {quotes ? Math.max(1, Math.ceil(quotes.total / quotes.pageSize)) : 1} · {quotes?.total} quotes
        </span>
        <button type="button" onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export function RadarPage() {
  return <DemoGate>{({ ctx }) => <RadarInner ctx={ctx} />}</DemoGate>;
}

const EMPTY_DRAFTS: Record<string, { hypothesis: string; ownerRole: string; test: string; successMetric: string }> = {};

function RadarInner({ ctx }: { ctx: QueryContext }) {
  const { filter, cmp, apply } = useFilters();
  const sp = useSearchParams();
  const briefHref = `/switch-radar/brief${sp.toString() ? `?${sp.toString()}` : ""}`;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    void query.ensure().then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  const data = ready
    ? query.getSwitchRadar(ctx, filter, { entityIds: cmp }).data
    : null;
  const userId = ctx.userId;
  const saveDraft = useDraftStore((s) => s.save);
  const drafts = useDraftStore((s) => s.byUser[userId] ?? EMPTY_DRAFTS);
  const saveView = useViewsStore((s) => s.save);
  const labels: Record<RadarFinding["panel"], string> = {
    strength: "Our relative strengths",
    complaint: "Complaints linked to low ratings",
    opportunity: "Competitor weaknesses to investigate",
    exposure: "Our competitive exposure",
  };
  const panels: RadarFinding["panel"][] = ["strength", "complaint", "opportunity", "exposure"];
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-navy">Switch Radar</h1>
        <LoadingState label="Ranking synthetic findings…" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-navy">Switch Radar</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportExcel(ctx, filter, cmp)}>
            Download Excel
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportPptx(ctx, filter, cmp)}>
            Download PowerPoint
          </Button>
          <Link href={briefHref} className="rounded border border-border px-3 py-1 text-[13px]">
            Print brief
          </Link>
        </div>
      </div>
      {data?.banners.map((b) => (
        <p key={b} className="text-[12px] text-ink-muted">
          {b}
        </p>
      ))}
      {filter.topicIds.length > 0 && (
        <Button size="sm" variant="outline" onClick={() => apply({ ...filter, topicIds: [] }, cmp)}>
          Use full category topic scope
        </Button>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {panels.map((panel) => {
          const items = (data?.findings ?? []).filter((f) => f.panel === panel);
          return (
            <WidgetCard key={panel} title={labels[panel]}>
              {items.length === 0 ? (
                <EmptyState
                  title="No findings meet the current evidence and gap thresholds."
                  body="Try a wider date range or fewer filters. Insufficient evidence is a result, not a missing chart."
                />
              ) : (
                <ul className="space-y-3">
                  {items.map((f) => (
                    <li key={f.id} className="rounded border border-border p-2">
                      <div className="font-medium">{f.statement}</div>
                      <div className="text-[11px] text-ink-muted">
                        Priority heuristic {f.priorityScore.toFixed(2)} · n={f.denominators.entityN ?? f.denominators.lowN} distinct reviews
                      </div>
                      <details className="mt-1">
                        <summary>Selected illustrative examples</summary>
                        <EvidenceList finding={f} ctx={ctx} filter={filter} />
                      </details>
                      <details className="mt-1">
                        <summary>Draft an action hypothesis</summary>
                        <textarea
                          className="mt-1 w-full rounded border border-border p-2"
                          defaultValue={drafts[f.id]?.hypothesis ?? f.nextStep.hypothesis}
                          onBlur={(e) =>
                            saveDraft(userId, f.id, {
                              hypothesis: e.target.value,
                              ownerRole: f.nextStep.ownerRole,
                              test: f.nextStep.test,
                              successMetric: f.nextStep.successMetric,
                            })
                          }
                        />
                        <p className="text-[11px] text-ink-muted">Saved locally. Nothing was sent to a team. No sales lift is estimated.</p>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </WidgetCard>
          );
        })}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          saveView(ctx.userId, ctx.workspace.id, {
            id: `view-${Date.now()}`,
            name: "Custom view",
            filters: filter,
            cmp,
            mode: ctx.workspace.reviewMode,
            datasetVersion: ctx.datasetVersion,
            workspaceId: ctx.workspace.id,
          })
        }
      >
        Save view
      </Button>
    </div>
  );
}

function EvidenceList({
  finding,
  ctx,
  filter,
}: {
  finding: RadarFinding;
  ctx: QueryContext;
  filter: QueryContext extends never ? never : import("@/types").FilterState;
}) {
  const [rows, setRows] = useState<string[]>([]);
  useEffect(() => {
    void query.ensure().then(() => {
      const page = query.getQuotes(ctx, finding.effectiveFilter, {
        page: 1,
        pageSize: 50,
        topicId: finding.topicId,
      }).data.rows;
      const texts = finding.evidence.map((e) => {
        const hit = page.find((r) => r.quote.id === e.quoteId);
        return hit ? `${e.entityId}: ${hit.quote.text}` : `Missing quote ${e.quoteId}`;
      });
      setRows(texts);
    });
  }, [finding, ctx, filter]);
  return (
    <ul className="mt-1 list-disc pl-5 text-[12px]">
      {rows.map((t) => (
        <li key={t}>{t}</li>
      ))}
      <li>
        <Link className="text-lightblue" href={`/topics/${finding.topicId}`}>
          View full illustrative review
        </Link>
      </li>
    </ul>
  );
}

export function ComparisonPage() {
  return <DemoGate>{({ ctx }) => <ComparisonInner ctx={ctx} />}</DemoGate>;
}

function ComparisonInner({ ctx }: { ctx: QueryContext }) {
  const { filter, cmp } = useFilters();
  const [data, setData] = useState<ReturnType<typeof query.getComparison>["data"] | null>(null);
  const [series, setSeries] = useState<ReturnType<typeof query.getComparisonSeries>["data"]>([]);
  useEffect(() => {
    void query.ensure().then(() => {
      setData(query.getComparison(ctx, filter, { entityIds: cmp }).data);
      setSeries(query.getComparisonSeries(ctx, filter, { entityIds: cmp }, "month").data);
    });
  }, [ctx, filter, cmp]);
  const topicIds = data?.columns[0]?.topicRows.filter((t) => !t.isMega).slice(0, 25) ?? [];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-navy">Comparison</h1>
      {data?.warnings.map((w) => (
        <p key={w} className="text-[12px] text-ink-muted">
          {w}
        </p>
      ))}
      <p className="text-[12px]">First column is your focal entity. Reordering competitors does not change it.</p>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] text-[12px]">
          <thead className="sticky top-0 bg-surface">
            <tr>
              <th className="sticky left-0 bg-surface p-2 text-left">Topic</th>
              {data?.columns.map((c) => (
                <th key={c.entityId} className="p-2">
                  {c.name}
                  {c.isBenchmark ? "" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topicIds.map((t) => (
              <tr key={t.topicId} className="border-t border-border">
                <td className="sticky left-0 bg-surface p-2">
                  {t.name}
                  <div className="text-[10px] text-ink-muted">n={t.distinctReviewN}</div>
                </td>
                {data?.columns.map((c) => {
                  const cell = c.topicRows.find((r) => r.topicId === t.topicId);
                  return (
                    <td key={c.entityId} className="p-2 tabular">
                      {cell == null || cell.support === "none" || cell.sentiment === null
                        ? "Insufficient evidence"
                        : `${cell.sentiment.toFixed(0)}% · ${formatPercent(cell.mentionShare)}`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <WidgetCard title="Volume by entity">
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="period" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              {series.map((s, i) => (
                <Line
                  key={s.entityId}
                  data={s.points}
                  dataKey="volume"
                  name={s.entityId}
                  stroke={s.entityId === "benchmark" ? INDUSTRY_COLOR : ENTITY_COLORS_LIGHT[i - 1] ?? ENTITY_COLORS_LIGHT[0]}
                  strokeDasharray={s.entityId === "benchmark" ? "6 4" : undefined}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </WidgetCard>
    </div>
  );
}

export function BriefPage() {
  return (
    <DemoGate print>
      {({ ctx }) => <BriefInner ctx={ctx} />}
    </DemoGate>
  );
}

function BriefInner({ ctx }: { ctx: QueryContext }) {
  const { filter, cmp } = useFilters();
  const [data, setData] = useState<ReturnType<typeof query.getSwitchRadar>["data"] | null>(null);
  useEffect(() => {
    void query.ensure().then(() => setData(query.getSwitchRadar(ctx, filter, { entityIds: cmp }).data));
  }, [ctx, filter, cmp]);
  const pick = (panel: RadarFinding["panel"]) => data?.findings.find((f) => f.panel === panel);
  const findings = ["strength", "complaint", "opportunity", "exposure"].map((p) => pick(p as RadarFinding["panel"]));
  const excerpts = findings.flatMap((f) => f?.evidence ?? []).slice(0, 2);
  return (
    <div className="mx-auto max-w-[800px] space-y-4 print:max-w-none">
      <h1 className="text-2xl font-semibold text-navy">Switch Brief</h1>
      <p className="text-[12px]">Synthetic demo — illustrative findings; not evidence of real brand performance</p>
      <p className="text-[12px]">
        {filter.dateFrom}–{filter.dateTo} · {ctx.workspace.reviewMode} · snapshot local · dataset {ctx.datasetVersion}
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        {findings.map((f, i) => (
          <li key={i}>{f?.statement ?? "No finding met evidence thresholds in this panel."}</li>
        ))}
      </ol>
      <h2 className="font-semibold">Excerpts</h2>
      <ul>
        {excerpts.map((e) => (
          <li key={e.quoteId}>{e.quoteId}</li>
        ))}
      </ul>
      <h2 className="font-semibold">Suggested next step</h2>
      <p>{findings.find(Boolean)?.nextStep.hypothesis}</p>
      <p className="text-[11px] text-ink-muted">
        Category benchmark includes selected brands. Reviews do not establish why non-buyers chose a competitor.
      </p>
    </div>
  );
}
