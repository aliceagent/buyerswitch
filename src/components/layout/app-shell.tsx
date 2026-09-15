"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/primitives";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { useUiStore, useViewsStore, type SavedView } from "@/stores/app-stores";
import { serializeUrlState } from "@/lib/filters";
import type { QueryContext, Workspace } from "@/types";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchPalette } from "@/components/layout/search-palette";

const EMPTY_WORKSPACES: Workspace[] = [];
const EMPTY_VIEWS: SavedView[] = [];

const NAV = [
  { href: "/switch-radar", label: "Switch Radar" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/topics", label: "Topics" },
  { href: "/comparison", label: "Comparison" },
  { href: "/star-rating", label: "Star rating" },
  { href: "/products", label: "Catalogue" },
  { href: "/reviews", label: "Reviews" },
];

export function AppShell({
  ctx,
  children,
  print = false,
}: {
  ctx: QueryContext;
  children: React.ReactNode;
  print?: boolean;
}) {
  const path = usePathname();
  const user = useAuthStore((s) => s.profiles.find((p) => p.id === s.selectedProfileId));
  const workspaces = useWorkspaceStore((s) => s.byUser[ctx.userId]?.workspaces ?? EMPTY_WORKSPACES);
  const setActive = useWorkspaceStore((s) => s.setActive);
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);

  if (print) {
    return <div className="bg-white p-8 text-[12px] text-ink">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="flex w-52 shrink-0 flex-col bg-navy text-white">
        <div className="px-4 py-4">
          <Wordmark />
          <p className="mt-1 text-[10px] text-white/70">Interactive concept · Synthetic data</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded px-3 py-2 text-[13px] ${path.startsWith(item.href) ? "bg-lightblue text-white" : "text-white/80 hover:bg-white/10"}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 px-3 text-[10px] uppercase tracking-wide text-white/50">Settings</div>
          <Link href="/settings/workspace" className="rounded px-3 py-2 text-[13px] text-white/80 hover:bg-white/10">
            Workspace
          </Link>
          <Link href="/settings/groups" className="rounded px-3 py-2 text-[13px] text-white/80 hover:bg-white/10">
            Groups
          </Link>
          <Link href="/settings/users" className="rounded px-3 py-2 text-[13px] text-white/80 hover:bg-white/10">
            Users
          </Link>
          <Link href="/settings/qa" className="rounded px-3 py-2 text-[13px] text-white/80 hover:bg-white/10">
            Data QA
          </Link>
        </nav>
        <div className="space-y-1 p-3 text-[11px] text-white/60">
          <Link href="/switch-radar/brief" className="block hover:text-white">
            Print brief
          </Link>
          <span>Exports: Excel · PowerPoint</span>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2">
          <select
            className="rounded border border-border bg-white px-2 py-1 text-[13px]"
            value={ctx.workspace.id}
            onChange={(e) => setActive(ctx.userId, e.target.value)}
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <span className="rounded bg-muted px-2 py-1 text-[12px] text-navy">
            Synthetic demo data · Jan 2019–Oct 2021 · {ctx.workspace.reviewMode}
          </span>
          <SavedViews ctx={ctx} />
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant={density === "compact" ? "default" : "outline"}
              onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")}
            >
              {density === "compact" ? "Compact" : "Comfortable"}
            </Button>
            <span className="text-[12px] text-ink-muted">{user?.displayName}</span>
            <Link href="/demo/reset" className="text-[12px] text-lightblue">
              Reset
            </Link>
            <SearchTrigger ctx={ctx} />
          </div>
        </header>
        <FilterBar ctx={ctx} />
        <main className="min-w-0 flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}

function SearchTrigger({ ctx }: { ctx: QueryContext }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Search
      </Button>
      <SearchPalette open={open} onOpenChange={setOpen} ctx={ctx} />
    </>
  );
}

function SavedViews({ ctx }: { ctx: QueryContext }) {
  const router = useRouter();
  const pathname = usePathname();
  const views = useViewsStore((s) => s.byUser[ctx.userId]?.[ctx.workspace.id] ?? EMPTY_VIEWS);
  return (
    <select
      className="max-w-[220px] rounded border border-border bg-white px-2 py-1 text-[13px]"
      defaultValue=""
      onChange={(e) => {
        const v = views.find((x) => x.id === e.target.value);
        if (!v) return;
        const params = serializeUrlState(v.filters, v.cmp, ctx.workspace.id);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <option value="">Saved views</option>
      {views.map((v) => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </select>
  );
}
