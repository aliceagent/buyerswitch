"use client";

import type { FilterState, QueryContext } from "@/types";
import { query } from "@/lib/query";

export async function exportPptx(ctx: QueryContext, filter: FilterState, cmp: string[]): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  await query.ensure();
  const snapshotId = `snap-${Date.now()}`;
  const radar = query.getSwitchRadar(ctx, filter, { entityIds: cmp });
  const pptx = new PptxGenJS();
  const title = pptx.addSlide();
  title.addText("BuyerSwitch Switch Radar", { x: 0.5, y: 0.4, fontSize: 24, color: "003349" });
  title.addText(`${ctx.workspace.name} · ${filter.dateFrom}–${filter.dateTo}`, { x: 0.5, y: 1.1, fontSize: 14 });
  title.addText("Synthetic demo — illustrative findings; not evidence of real brand performance", {
    x: 0.5,
    y: 1.6,
    fontSize: 12,
    color: "6B7270",
  });
  const slide = pptx.addSlide();
  slide.addText("Findings (image-based deck, not editable native charts)", { x: 0.4, y: 0.3, fontSize: 16, color: "003349" });
  radar.data.findings.slice(0, 6).forEach((f, i) => {
    slide.addText(`${f.panel}: ${f.statement}`, { x: 0.4, y: 0.8 + i * 0.7, fontSize: 12, w: 9 });
  });
  const method = pptx.addSlide();
  method.addText("Methodology", { x: 0.5, y: 0.4, fontSize: 18, color: "003349" });
  method.addText(
    `Snapshot ${snapshotId}. Dataset ${ctx.datasetVersion}. Overlay ${ctx.overlayRevision}. Category benchmark includes selected brands. n=${radar.meta.distinctReviewN} distinct reviews.`,
    { x: 0.5, y: 1.1, w: 9, fontSize: 14 },
  );
  await pptx.writeFile({ fileName: `buyerswitch-${snapshotId}.pptx` });
}
