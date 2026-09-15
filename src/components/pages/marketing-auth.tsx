"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wordmark } from "@/components/brand/primitives";
import { Button } from "@/components/ui/button";
import { useAuthStore, ALEX, JORDAN } from "@/stores/auth";
import { useBillingStore } from "@/stores/app-stores";
import { useWorkspaceStore } from "@/stores/workspace";
import { openDemoScenario, seedDemoProfile, useCorpus } from "@/lib/demo";
import { ErrorState, LoadingState } from "@/components/brand/primitives";
import { loadCorpus } from "@/lib/query";
import { HERO_STORY } from "@/lib/scenario";
import { useEffect, useState } from "react";

export function MarketingHome() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void loadCorpus();
  }, []);
  return (
    <MarketingFrame>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-[12px] uppercase tracking-wide text-lightblue">Interactive concept · Synthetic data</p>
        <h1 className="font-editorial mt-3 text-4xl text-navy md:text-5xl">
          See where competitors win on the things buyers talk about.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink-muted">
          Identify a supported attribute gap, read both sides, and leave with a next step. This scenario uses a synthetic audio-category dataset.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-surface-muted p-5">
          <p className="text-[11px] uppercase tracking-wide text-ink-muted">{HERO_STORY.gapLabel}</p>
          <h2 className="mt-1 font-editorial text-2xl text-navy">{HERO_STORY.headline}</h2>
          <p className="mt-2 text-[13px] text-ink-muted">{HERO_STORY.nLabel}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <blockquote className="rounded-lg border border-border bg-white p-3 text-[14px]">
              <p className="text-[11px] text-ink-muted">{HERO_STORY.appleWho}</p>
              <p className="mt-1">“{HERO_STORY.appleQuote}”</p>
            </blockquote>
            <blockquote className="rounded-lg border border-border bg-white p-3 text-[14px]">
              <p className="text-[11px] text-ink-muted">{HERO_STORY.tozoWho}</p>
              <p className="mt-1">“{HERO_STORY.tozoQuote}”</p>
            </blockquote>
          </div>
          <p className="mt-4 text-[13px] text-navy">
            Suggested next step: {HERO_STORY.nextStep}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void openDemoScenario().then((href) => router.push(href));
              }}
            >
              {busy ? "Opening scenario…" : "Open this scenario"}
            </Button>
            <Link href="/product" className="rounded border border-border px-4 py-2 text-[13px]">
              How it works
            </Link>
          </div>
        </div>
        <p className="mt-8 max-w-2xl text-[13px] text-ink-muted">
          Reviews describe what reviewers experienced. They do not establish why non-buyers chose a competitor or measure market share, switching rates or causal sales impact.
        </p>
      </div>
    </MarketingFrame>
  );
}

function MarketingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-between bg-navy px-6 py-3 text-white">
        <Wordmark />
        <nav className="flex gap-4 text-[13px]">
          <Link href="/product">Product</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/">Open scenario</Link>
        </nav>
      </header>
      {children}
      <footer className="border-t border-border px-6 py-8 text-[12px] text-ink-muted">
        <Link href="/">Demo</Link>
        <p className="mt-2">Concept frontend. No live collection, payments, or CRM.</p>
      </footer>
    </div>
  );
}

export function ProductPage() {
  return (
    <MarketingFrame>
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
        <h1 className="font-editorial text-4xl text-navy">How the concept works</h1>
        {["Finding", "Evidence", "Change over time", "Action and export"].map((t) => (
          <section key={t}>
            <h2 className="text-xl font-semibold text-navy">{t}</h2>
            <p className="text-ink-muted">
              {t === "Finding" && "Attribute-level comparisons show how product opinions differ across the selected category."}
              {t === "Evidence" && "Read the full illustrative review behind a highlighted opinion."}
              {t === "Change over time" && "Monthly windows keep denominators visible so a dip is not treated as lost buyers."}
              {t === "Action and export" && "Save a competitive question and export a brief with supporting data."}
            </p>
          </section>
        ))}
      </div>
    </MarketingFrame>
  );
}

export function PricingPage() {
  const plans = [
    { id: "starter", name: "Starter", month: "$1,200", year: "$11,520/year ($960/month equivalent)", note: "1 workspace, 3 seats, comparisons, core Switch Radar, Excel" },
    { id: "growth", name: "Growth", month: "$3,500", year: "$33,600/year ($2,800/month equivalent)", note: "3 workspaces, 15 seats, deeper history, PowerPoint, proposed alerts" },
    { id: "enterprise", name: "Enterprise", month: "To scope", year: "To scope", note: "Negotiated coverage, access requirements and service levels" },
  ];
  return (
    <MarketingFrame>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-editorial text-4xl text-navy">Illustrative packaging — pricing is not finalized</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className="rounded-lg border border-border p-4">
              <h2 className="font-semibold">{p.name}</h2>
              <p className="tabular">{p.month}</p>
              <p className="text-[12px] text-ink-muted">{p.year}</p>
              <p className="mt-2 text-[13px]">{p.note}</p>
              <Link href={`/billing?plan=${p.id}`} className="mt-4 inline-block text-lightblue">
                Preview this plan
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-ink-muted">No purchase, trial contract or charge is created. Demo includes all features regardless of selected preview tier.</p>
      </div>
    </MarketingFrame>
  );
}

export function SignupPage() {
  const router = useRouter();
  const upsert = useAuthStore((s) => s.upsertProfile);
  const setSelected = useAuthStore((s) => s.setSelected);
  const [label, setLabel] = useState(JORDAN.displayName);
  return (
    <AuthFrame title="Create a demo profile">
      <p className="text-[12px] text-ink-muted">Profiles are stored only in this browser. Do not enter personal or confidential information.</p>
      <label className="mt-4 block text-[13px]">
        Display label
        <input className="mt-1 w-full rounded border border-border px-2 py-1" value={label} onChange={(e) => setLabel(e.target.value)} />
      </label>
      <p className="mt-2 text-[13px]">{JORDAN.email} · {JORDAN.company}</p>
      <Button
        className="mt-4"
        onClick={() => {
          const id = `user-${crypto.randomUUID()}`;
          upsert({ ...JORDAN, id, displayName: label, createdAt: new Date().toISOString() });
          setSelected(id);
          router.push("/onboarding/workspace");
        }}
      >
        Continue
      </Button>
    </AuthFrame>
  );
}

export function LoginPage() {
  const profiles = useAuthStore((s) => s.profiles);
  const setSelected = useAuthStore((s) => s.setSelected);
  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get("returnTo") ?? "/switch-radar";
  const safe = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/switch-radar";
  return (
    <AuthFrame title="Choose a saved demo profile">
      <p className="text-[12px] text-ink-muted">Profiles are stored only in this browser. Do not enter personal or confidential information.</p>
      <ul className="mt-4 space-y-2">
        {profiles.map((p) => (
          <li key={p.id}>
            <Button
              variant="outline"
              onClick={() => {
                setSelected(p.id);
                router.push(safe);
              }}
            >
              {p.displayName} · {p.email}
            </Button>
          </li>
        ))}
      </ul>
      <Link href="/signup" className="mt-4 inline-block text-lightblue">
        Create another demo profile
      </Link>
    </AuthFrame>
  );
}

export function BillingPage() {
  const userId = useAuthStore((s) => s.selectedProfileId);
  const save = useBillingStore((s) => s.save);
  const skip = useBillingStore((s) => s.skip);
  const router = useRouter();
  const sp = useSearchParams();
  const plan = (["starter", "growth", "enterprise"] as const).includes(sp.get("plan") as never)
    ? (sp.get("plan") as "starter" | "growth" | "enterprise")
    : "starter";
  const [interval, setInterval] = useState<"month" | "year">("month");
  if (!userId) return <LoginPage />;
  return (
    <AuthFrame title="Preview plan selection">
      <p>Selected: {plan}</p>
      <p>Test payment method · Visa ending 4242</p>
      <label className="mt-2 block">
        <input type="radio" checked={interval === "month"} onChange={() => setInterval("month")} /> Monthly
      </label>
      <label className="block">
        <input type="radio" checked={interval === "year"} onChange={() => setInterval("year")} /> Annual illustration
      </label>
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => {
            save(userId, plan, interval);
            router.push("/onboarding/workspace");
          }}
        >
          Save demo selection
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            skip(userId);
            router.push("/onboarding/workspace");
          }}
        >
          Skip to workspace
        </Button>
      </div>
      <p className="mt-3 text-[12px] text-ink-muted">Selection saved in this browser. No payment was processed.</p>
    </AuthFrame>
  );
}

export function OnboardingWorkspacePage() {
  const userId = useAuthStore((s) => s.selectedProfileId);
  const router = useRouter();
  const [market, setMarket] = useState<"US" | "US-CA">("US-CA");
  if (!userId) return <LoginPage />;
  return (
    <AuthFrame title="Set up a sample workspace">
      <p>Audio Devices: Synthetic sample available. Other categories: Coverage not included in this demo.</p>
      <label className="mt-3 block">
        Market
        <select value={market} onChange={(e) => setMarket(e.target.value as "US" | "US-CA")} className="ml-2 rounded border border-border">
          <option value="US">United States</option>
          <option value="US-CA">United States + Canada</option>
        </select>
      </label>
      <Button className="mt-4" onClick={() => router.push(`/onboarding/brands?market=${market}`)}>
        Explore audio sample
      </Button>
      <p className="mt-2 text-[12px]">Interest saved in this browser. Nothing was sent to a team.</p>
    </AuthFrame>
  );
}

export function OnboardingBrandsPage() {
  const userId = useAuthStore((s) => s.selectedProfileId);
  const router = useRouter();
  const sp = useSearchParams();
  const market = sp.get("market") === "US" ? "US" : "US-CA";
  if (!userId) return <LoginPage />;
  return (
    <AuthFrame title="Choose a focal brand">
      <p>Suggestions use review-volume proximity, not market share.</p>
      <Button className="mt-4" onClick={() => router.push(`/onboarding/ingest?market=${market}`)}>
        Continue with TOZO
      </Button>
    </AuthFrame>
  );
}

export function OnboardingIngestPage() {
  const { corpus, error, retry, loading } = useCorpus();
  const userId = useAuthStore((s) => s.selectedProfileId);
  const router = useRouter();
  const sp = useSearchParams();
  if (loading) return <LoadingState label="Loading sample" />;
  if (error || !corpus) return <ErrorState title="Could not prepare sample" body={error ?? ""} onRetry={retry} />;
  if (!userId) return <LoginPage />;
  const market = sp.get("market") === "US" ? "US" : "US-CA";
  return (
    <AuthFrame title="Preparing the sample workspace">
      <ol className="list-decimal pl-5 text-[13px]">
        <li>Loading sample</li>
        <li>Applying source selection</li>
        <li>Identifying repeated observations</li>
        <li>Loading opinion labels</li>
        <li>Building comparisons</li>
      </ol>
      <Button
        className="mt-4"
        onClick={() => {
          seedDemoProfile(corpus);
          const sources =
            market === "US"
              ? (["amazon", "bestbuy", "walmart", "target"] as const)
              : (["amazon", "bestbuy", "walmart", "target", "amazon_ca", "bestbuy_ca"] as const);
          useWorkspaceStore.getState().updateWorkspace(ALEX.id, "ws-audio-us-ca", {
            market,
            sources: [...sources],
            name: market === "US" ? "Audio Devices US" : "Audio Devices US + Canada",
          });
          router.push("/switch-radar");
        }}
      >
        Fast path — open Radar
      </Button>
      <p className="mt-2">Your demo workspace is ready</p>
    </AuthFrame>
  );
}

function AuthFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="bg-navy px-6 py-3 text-white">
        <Wordmark />
      </header>
      <div className="mx-auto max-w-lg p-8">
        <h1 className="text-2xl font-semibold text-navy">{title}</h1>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function DemoReadyPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-semibold text-navy">Demo ready</h1>
      <p className="mt-2 text-[13px] text-ink-muted">
        Opens a fictional Alex Rivera profile and the TOZO competitive exposure view. Does not wipe other local edits.
      </p>
      <Button
        className="mt-4"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void openDemoScenario().then((href) => router.push(href));
        }}
      >
        Restore demo scenario
      </Button>
    </div>
  );
}

export function DemoResetPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-semibold text-navy">Reset</h1>
      <p>Reset is deliberate. Choose a scope.</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button variant="outline" onClick={() => router.push("/demo/ready")}>
          Restore demo scenario
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            Object.keys(localStorage)
              .filter((k) => k.startsWith("bs."))
              .forEach((k) => localStorage.removeItem(k));
            router.push("/demo/ready");
          }}
        >
          Clear all BuyerSwitch state in this browser
        </Button>
      </div>
    </div>
  );
}
