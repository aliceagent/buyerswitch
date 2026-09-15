export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-1 font-semibold tracking-tight text-white ${className}`}>
      <span>Buyer</span>
      <span className="text-[color:var(--lightblue)]">Switch</span>
    </div>
  );
}

export function SentimentPill({
  value,
  bucket,
}: {
  value: number | null;
  bucket: 1 | 2 | 3 | 4 | 5;
}) {
  const bg = `var(--sent-${bucket})`;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs tabular text-white"
      style={{ background: value === null ? "var(--ink-muted)" : bg, color: bucket === 3 ? "var(--ink)" : "#fff" }}
    >
      {value === null ? "No data" : `${value.toFixed(0)}%`}
    </span>
  );
}

export function Delta({
  delta,
  reason,
  goodDirection,
  unit,
}: {
  delta: number | null;
  reason?: string;
  goodDirection: "up" | "down" | "neutral";
  unit: "count" | "percent" | "stars";
}) {
  if (delta === null) {
    return <span className="text-[color:var(--delta-neutral)]">{reason ?? "n/a"}</span>;
  }
  const up = delta > 0;
  const color =
    goodDirection === "neutral"
      ? "var(--delta-neutral)"
      : (up && goodDirection === "up") || (!up && goodDirection === "down")
        ? "var(--delta-up)"
        : "var(--delta-down)";
  const arrow = delta === 0 ? "→" : up ? "↑" : "↓";
  const label =
    unit === "percent" ? `${up ? "+" : ""}${delta.toFixed(1)} pp` : unit === "stars" ? `${up ? "+" : ""}${delta.toFixed(2)}` : `${up ? "+" : ""}${Math.round(delta)}`;
  return (
    <span className="tabular" style={{ color }}>
      {arrow} {label}
    </span>
  );
}

export function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-ink-muted">No data</span>;
  const full = Math.round(value);
  return (
    <span className="tabular" aria-label={`${value.toFixed(2)} stars`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)} {value.toFixed(2)}
    </span>
  );
}

export function SourceTag({ name }: { name: string }) {
  return (
    <span className="rounded px-1.5 py-0.5 text-[11px]" style={{ background: "var(--chip-sources-bg)", color: "var(--chip-sources-fg)" }}>
      {name}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="font-semibold text-navy">{title}</h2>
      <p className="mt-1 text-ink-muted">{body}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="font-semibold text-navy">{title}</h2>
      <p className="mt-1 text-ink-muted">{body}</p>
      {onRetry ? (
        <button className="mt-3 text-lightblue underline" onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = "Loading synthetic corpus…" }: { label?: string }) {
  return <div className="p-6 text-ink-muted">{label}</div>;
}
