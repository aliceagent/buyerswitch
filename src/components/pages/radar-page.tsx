"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { query } from "@/lib/query";
import { DemoGate } from "@/components/layout/demo-gate";
import { useFilters } from "@/components/filters/filter-bar";
import { WidgetCard } from "@/components/widgets/kpi-strip";
import { EmptyState, LoadingState } from "@/components/brand/primitives";
import { SOURCE_LABELS } from "@/lib/format";
import { useDraftStore, useUiStore, useViewsStore } from "@/stores/app-stores";
import type { EvidenceDisplay, QueryContext, RadarFinding, TopicEntityBar } from "@/types";
import { Button } from "@/components/ui/button";
import { exportExcel } from "@/lib/excel-export";
import { exportPptx } from "@/lib/pptx-export";
import { cleanStatement, panelLabel, pickHeroFinding, supportLine } from "@/lib/radar-helpers";

const EMPTY_DRAFTS: Record<string, { hypothesis: string; ownerRole: string; test: string; successMetric: string }> = {};

export function RadarPage() {
  return <DemoGate>{({ ctx }) => <RadarInner ctx={ctx} />}</DemoGate>;
}

function RadarInner({ ctx }: { ctx: QueryContext }) {
  const { filter, cmp, apply } = useFilters();
  const sp = useSearchParams();
  const briefHref = `/switch-radar/brief${sp.toString() ? `?${sp.toString()}` : ""}`;
  const [ready, setReady] = useState(false);
  const [heroId, setHeroId] = useState<string | null>(null);
  const tourDismissed = useUiStore((s) => s.tourDismissed);
  const dismissTour = useUiStore((s) => s.dismissTour);
  useEffect(() => {
    let live = true;
    void query.ensure().then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  const data = ready ? query.getSwitchRadar(ctx, filter, { entityIds: cmp }).data : null;
  const findings = useMemo(() => data?.findings ?? [], [data]);
  const selected = useMemo(() => {
    if (!findings.length) return null;
    return findings.find((f) => f.id === heroId) ?? pickHeroFinding(findings);
  }, [findings, heroId]);
  const bars = ready && selected ? query.getTopicEntityBars(ctx, filter, selected.topicId, cmp).data : [];
  const evidence = ready && selected ? query.getEvidencePack(selected) : [];
  const userId = ctx.userId;
  const saveDraft = useDraftStore((s) => s.save);
  const drafts = useDraftStore((s) => s.byUser[userId] ?? EMPTY_DRAFTS);
  const saveView = useViewsStore((s) => s.save);
  const labels: Record<RadarFinding["panel"], string> = {
    strength: "Relative strengths",
    complaint: "Complaints linked to low ratings",
    opportunity: "Competitor weaknesses",
    exposure: "Competitive exposure",
  };
  const panels: RadarFinding["panel"][] = ["exposure", "opportunity", "complaint", "strength"];

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
          <p className="text-[12px] text-ink-muted">
            Illustrative review differences, not measured switching or purchase intent.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
      {!tourDismissed && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-marigold bg-[#fff8e8] px-3 py-2 text-[13px] text-navy">
          <span>1. Read the gap · 2. Inspect both reviews · 3. Print the brief</span>
          <button type="button" className="text-[12px] underline" onClick={dismissTour}>
            Dismiss
          </button>
        </div>
      )}
      {filter.topicIds.length > 0 && (
        <Button size="sm" variant="outline" onClick={() => apply({ ...filter, topicIds: [] }, cmp)}>
          Use full category topic scope
        </Button>
      )}
      {selected ? (
        <HeroFinding
          finding={selected}
          bars={bars}
          evidence={evidence}
          draft={drafts[selected.id]}
          onSave={(hypothesis) =>
            saveDraft(userId, selected.id, {
              hypothesis,
              ownerRole: selected.nextStep.ownerRole,
              test: selected.nextStep.test,
              successMetric: selected.nextStep.successMetric,
            })
          }
        />
      ) : (
        <EmptyState
          title="No findings meet the current evidence and gap thresholds."
          body="Try a wider date range or fewer filters. Insufficient evidence is a result, not a missing chart."
        />
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {panels.map((panel) => {
          const items = findings.filter((f) => f.panel === panel).slice(0, 3);
          return (
            <WidgetCard key={panel} title={labels[panel]}>
              {items.length === 0 ? (
                <p className="text-[13px] text-ink-muted">No supported finding in this panel.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        className={`w-full rounded border p-2 text-left text-[13px] ${f.id === selected?.id ? "border-lightblue bg-[#e8f7fb]" : "border-border"}`}
                        onClick={() => setHeroId(f.id)}
                      >
                        <div className="font-medium">{cleanStatement(f.statement)}</div>
                        <div className="text-[11px] text-ink-muted">{supportLine(f)}</div>
                      </button>
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

function HeroFinding({
  finding,
  bars,
  evidence,
  draft,
  onSave,
}: {
  finding: RadarFinding;
  bars: TopicEntityBar[];
  evidence: EvidenceDisplay[];
  draft?: { hypothesis: string; ownerRole: string; test: string; successMetric: string };
  onSave: (hypothesis: string) => void;
}) {
  const topicName = finding.statement.match(/on ([^.]*) while/)?.[1] ?? finding.topicId;
  return (
    <section className="rounded-xl border border-border bg-white p-4">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{panelLabel(finding.panel)}</p>
      <h2 className="mt-1 font-editorial text-2xl text-navy">{cleanStatement(finding.statement)}</h2>
      <p className="mt-1 text-[13px] text-ink-muted">{supportLine(finding)}</p>
      {bars.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[12px] text-ink-muted">Positive opinion share on this topic</p>
          {bars.map((row) => (
            <div key={row.entityId} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-[12px]">{row.name}</span>
              <span className="relative h-3 min-w-[160px] flex-1 rounded bg-muted">
                <span
                  className="absolute inset-y-0 left-0 rounded bg-lightblue"
                  style={{ width: `${Math.min(100, row.sentiment ?? 0)}%` }}
                />
              </span>
              <span className="w-16 text-right text-[12px] tabular text-ink-muted">
                {row.sentiment == null ? "—" : `${row.sentiment.toFixed(0)}%`}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {evidence.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No illustrative excerpts met the selection rules.</p>
        ) : (
          evidence.slice(0, 2).map((row) => <EvidenceCard key={row.quoteId} row={row} />)
        )}
      </div>
      <p className="mt-3 text-[13px]">
        <Link className="text-lightblue" href={`/topics/${finding.topicId}`}>
          More {topicName} excerpts
        </Link>
      </p>
      <div className="mt-4 rounded-lg border border-border bg-surface-muted p-3">
        <p className="text-[12px] font-medium text-navy">Suggested next step</p>
        <p className="text-[12px] text-ink-muted">
          Owner: {finding.nextStep.ownerRole} · {finding.nextStep.test}
        </p>
        <textarea
          className="mt-2 w-full rounded border border-border bg-white p-2 text-[13px]"
          defaultValue={draft?.hypothesis ?? finding.nextStep.hypothesis}
          onBlur={(e) => onSave(e.target.value)}
        />
        <p className="mt-1 text-[11px] text-ink-muted">
          {finding.nextStep.successMetric} Saved locally. Nothing was sent to a team.
        </p>
      </div>
    </section>
  );
}

export function EvidenceCard({ row }: { row: EvidenceDisplay }) {
  const start = row.charStart;
  const end = row.charEnd;
  const before = row.reviewText.slice(0, start);
  const mark = row.reviewText.slice(start, end) || row.quoteText;
  const after = row.reviewText.slice(end);
  return (
    <article className="rounded-lg border border-border bg-white p-3 text-[13px]">
      <p className="text-[11px] text-ink-muted">
        {row.entityName} · {SOURCE_LABELS[row.source]} · {row.stars}★ · {row.postDate} · Illustrative review · Synthetic
        text
      </p>
      <p className="mt-2 whitespace-pre-wrap">
        {before}
        <mark className="bg-marigold/40">{mark}</mark>
        {after}
      </p>
    </article>
  );
}
