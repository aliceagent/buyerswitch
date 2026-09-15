"use client";

import { useEffect, useState } from "react";
import { query } from "@/lib/query";
import { DemoGate } from "@/components/layout/demo-gate";
import { useFilters } from "@/components/filters/filter-bar";
import { DataTable } from "@/components/widgets/data-table";
import { formatMetric, SOURCE_LABELS } from "@/lib/format";
import type { QueryContext } from "@/types";
import { Button } from "@/components/ui/button";
import { useQaStore, useTeamStore, type Teammate } from "@/stores/app-stores";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";

const EMPTY_TEAM: Teammate[] = [];

export function StarRatingPage() {
  return (
    <DemoGate>
      {({ ctx }) => <StarInner ctx={ctx} />}
    </DemoGate>
  );
}

function StarInner({ ctx }: { ctx: QueryContext }) {
  const { filter } = useFilters();
  const [rows, setRows] = useState<ReturnType<typeof query.getStarDrivers>["data"]>([]);
  useEffect(() => {
    void query.ensure().then(() => setRows(query.getStarDrivers(ctx, filter).data));
  }, [ctx, filter]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-navy">Rating associations</h1>
      <p className="text-[12px] text-ink-muted">
        Association, not estimated causal rating impact. Compares 1–2★ with 5★; star filter does not apply here.
      </p>
      <DataTable
        rows={rows.filter((r) => r.support).map((r) => ({ ...r, id: r.topicId }))}
        columns={[
          { id: "name", header: "Topic", sortValue: (r) => r.name, cell: (r) => r.name },
          { id: "low", header: "1–2★ mention %", sortValue: (r) => r.lowMention, cell: (r) => formatMetric({ value: r.lowMention, delta: null, deltaKind: "points", unit: "percent", goodDirection: "neutral" }) },
          { id: "high", header: "5★ mention %", sortValue: (r) => r.highMention, cell: (r) => formatMetric({ value: r.highMention, delta: null, deltaKind: "points", unit: "percent", goodDirection: "neutral" }) },
          { id: "n", header: "Band n", cell: (r) => `${r.lowN} / ${r.highN}` },
        ]}
        total={rows.filter((r) => r.support).length}
        page={1}
        pageSize={50}
        onPage={() => undefined}
        empty="Insufficient evidence in one or both bands."
      />
    </div>
  );
}

export function ProductsPage() {
  return (
    <DemoGate>
      {({ ctx }) => <ProductsInner ctx={ctx} />}
    </DemoGate>
  );
}

function ProductsInner({ ctx }: { ctx: QueryContext }) {
  const { filter } = useFilters();
  const [rows, setRows] = useState<ReturnType<typeof query.getEntities>["data"]>([]);
  useEffect(() => {
    void query.ensure().then(() => setRows(query.getEntities(ctx, filter, "product").data));
  }, [ctx, filter]);
  return (
    <div>
      <h1 className="mb-3 text-xl font-semibold text-navy">Catalogue</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.slice(0, 30).map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-surface p-3">
            {r.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.imageUrl} alt="" width={96} height={96} />
            ) : null}
            <div className="font-medium">{r.name}</div>
            <div className="text-[12px] text-ink-muted">{r.source ? SOURCE_LABELS[r.source] : ""} · {formatMetric(r.metrics.reviews)} reviews</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewsPage() {
  return (
    <DemoGate>
      {({ ctx }) => <ReviewsInner ctx={ctx} />}
    </DemoGate>
  );
}

function ReviewsInner({ ctx }: { ctx: QueryContext }) {
  const { filter } = useFilters();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReturnType<typeof query.getReviews>["data"] | null>(null);
  useEffect(() => {
    void query.ensure().then(() => setData(query.getReviews(ctx, filter, { page, pageSize: 25 }).data));
  }, [ctx, filter, page]);
  return (
    <div>
      <h1 className="mb-3 text-xl font-semibold text-navy">Reviews</h1>
      <p className="text-[12px] text-ink-muted">
        {ctx.workspace.reviewMode === "all" ? "All mode includes labeled duplicate observations." : "Unique mode counts each canonical review once."}
      </p>
      {data?.rows.map((r) => (
        <article key={r.occurrenceId} className="mb-3 rounded-lg border border-border bg-surface p-3">
          <div className="text-[11px] text-ink-muted">
            {r.isDuplicate ? "Duplicate observation · " : ""}
            {SOURCE_LABELS[r.source]} · {r.stars}★ · {r.postDate} · review sentiment is a summary
          </div>
          <p className="mt-1 whitespace-pre-wrap">{r.text}</p>
        </article>
      ))}
      <div className="flex gap-2 text-[12px]">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
        <span>
          {data?.page} · {data?.total} matching units
        </span>
        <button type="button" onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export function SettingsWorkspacePage() {
  return <DemoGate>{({ ctx }) => <WorkspaceSettings ctx={ctx} />}</DemoGate>;
}

function WorkspaceSettings({ ctx }: { ctx: QueryContext }) {
  const update = useWorkspaceStore((s) => s.updateWorkspace);
  return (
    <div className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold text-navy">Workspace settings</h1>
      <label className="block text-[13px]">
        Name
        <input
          className="mt-1 w-full rounded border border-border px-2 py-1"
          defaultValue={ctx.workspace.name}
          onBlur={(e) => update(ctx.userId, ctx.workspace.id, { name: e.target.value })}
        />
      </label>
      <label className="block text-[13px]">
        Review mode
        <select
          className="mt-1 w-full rounded border border-border px-2 py-1"
          defaultValue={ctx.workspace.reviewMode}
          onChange={(e) => update(ctx.userId, ctx.workspace.id, { reviewMode: e.target.value as "unique" | "all" })}
        >
          <option value="unique">Unique</option>
          <option value="all">All</option>
        </select>
      </label>
      <p className="text-[12px] text-ink-muted">Schedule is a planned local preference. SSO is an unavailable preview.</p>
    </div>
  );
}

export function SettingsGroupsPage() {
  return <DemoGate>{({ ctx, corpus }) => <GroupsSettings ctx={ctx} corpus={corpus} />}</DemoGate>;
}

function GroupsSettings({ ctx, corpus }: { ctx: QueryContext; corpus: import("@/types").Corpus }) {
  const groups = useWorkspaceStore((s) => s.byUser[ctx.userId]?.groups[ctx.workspace.id] ?? ctx.groups);
  const setGroups = useWorkspaceStore((s) => s.setGroups);
  return (
    <div>
      <h1 className="text-xl font-semibold text-navy">Groups</h1>
      <ul className="mt-3 space-y-2">
        {groups.map((g) => (
          <li key={g.id} className="rounded border border-border p-2">
            {g.name} · {g.productIds.length} listings
          </li>
        ))}
      </ul>
      <Button
        className="mt-3"
        onClick={() =>
          setGroups(ctx.userId, ctx.workspace.id, [
            ...groups,
            { id: `g-local-${Date.now()}`, name: "Local group", productIds: corpus.products.slice(0, 3).map((p) => p.id) },
          ])
        }
      >
        Add local group
      </Button>
    </div>
  );
}

export function SettingsUsersPage() {
  return <DemoGate>{({ ctx }) => <UsersSettings ctx={ctx} />}</DemoGate>;
}

function UsersSettings({ ctx }: { ctx: QueryContext }) {
  const team = useTeamStore((s) => s.byUser[ctx.userId]?.[ctx.workspace.id] ?? EMPTY_TEAM);
  const add = useTeamStore((s) => s.add);
  const role = useAuthStore((s) => s.roleByUser[ctx.userId] ?? "admin");
  return (
    <div>
      <h1 className="text-xl font-semibold text-navy">Users</h1>
      <p className="text-[12px] text-ink-muted">Fictional teammates. Local teammate added. No invitation was sent. Roles are presentation, not security.</p>
      <ul className="mt-3">
        {team.map((t) => (
          <li key={t.id}>
            {t.name} · {t.role}
          </li>
        ))}
      </ul>
      {role === "viewer" ? (
        <p>Viewer cannot add teammates.</p>
      ) : (
        <Button className="mt-3" onClick={() => add(ctx.userId, ctx.workspace.id, { id: `t-${Date.now()}`, name: "Sam Taylor", email: "sam.taylor@example.com", role: "analyst" })}>
          Add local teammate
        </Button>
      )}
    </div>
  );
}

export function SettingsQaPage() {
  return (
    <DemoGate>
      {({ ctx, corpus }) => <QaInner ctx={ctx} quoteId={(corpus.fixtures.qaError as { quoteId: string }).quoteId} />}
    </DemoGate>
  );
}

function QaInner({ ctx, quoteId }: { ctx: QueryContext; quoteId: string }) {
  const apply = useQaStore((s) => s.apply);
  const undo = useQaStore((s) => s.undo);
  const state = useQaStore((s) => s.byUser[ctx.userId]?.[ctx.workspace.id]);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-navy">Data QA</h1>
      <p>Reviewed-item acceptance uses the items you actually opened. This is not model accuracy.</p>
      <p>Seeded Connectivity fixture is intentionally wrong until corrected.</p>
      <Button
        onClick={() =>
          apply(ctx.userId, ctx.workspace.id, {
            quoteId,
            userId: ctx.userId,
            workspaceId: ctx.workspace.id,
            before: { sentiment: "positive" },
            after: { sentiment: "negative" },
            reason: "correct connectivity polarity",
          })
        }
      >
        Reclassify fixture as negative
      </Button>
      <Button variant="outline" onClick={() => undo(ctx.userId, ctx.workspace.id)}>
        Undo
      </Button>
      <p className="text-[12px]">Overlay revision {state?.revision ?? 0} · {state?.events.length ?? 0} audit events</p>
    </div>
  );
}
