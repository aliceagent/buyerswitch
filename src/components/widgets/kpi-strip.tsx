"use client";

import type { Metric } from "@/types";
import { Delta } from "@/components/brand/primitives";
import { formatMetric } from "@/lib/format";

export function KpiStrip({
  items,
  footer,
}: {
  items: { label: string; metric: Metric; hint?: string }[];
  footer?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-surface p-4">
            <div className="text-[12px] text-ink-muted">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold tabular text-navy">{formatMetric(item.metric)}</div>
            <div className="mt-1 text-[12px]">
              <Delta
                delta={item.metric.delta}
                reason={item.metric.deltaReason}
                goodDirection={item.metric.goodDirection}
                unit={item.metric.unit}
              />
            </div>
            {item.hint ? <p className="mt-1 text-[11px] text-ink-muted">{item.hint}</p> : null}
          </div>
        ))}
      </div>
      {footer ? <p className="mt-2 text-[11px] text-ink-muted">{footer}</p> : null}
    </div>
  );
}

export function WidgetCard({
  title,
  children,
  menu,
}: {
  title: string;
  children: React.ReactNode;
  menu?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-navy">{title}</h2>
        {menu}
      </div>
      {children}
    </section>
  );
}
