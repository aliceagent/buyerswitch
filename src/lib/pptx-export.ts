"use client";

import type { FilterState, QueryContext } from "@/types";
import { query } from "@/lib/query";
import { pickHeroFinding, cleanStatement } from "@/lib/radar-helpers";

export async function exportPptx(ctx: QueryContext, filter: FilterState, cmp: string[]): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  await query.ensure();
  const snapshotId = `snap-${Date.now()}`;
  const radar = query.getSwitchRadar(ctx, filter, { entityIds: cmp });
  const hero = pickHeroFinding(radar.data.findings);
  const excerpts = hero ? query.getEvidencePack(hero).slice(0, 2) : [];
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
  slide.addText("Four findings", { x: 0.4, y: 0.3, fontSize: 16, color: "003349" });
  const panels = ["exposure", "opportunity", "complaint", "strength"] as const;
  panels.forEach((panel, i) => {
    const f = radar.data.findings.find((row) => row.panel === panel);
    slide.addText(f ? cleanStatement(f.statement) : `No ${panel} finding met thresholds.`, {
      x: 0.4,
      y: 0.8 + i * 0.9,
      fontSize: 14,
      w: 9,
    });
  });
  const quotes = pptx.addSlide();
  quotes.addText("Illustrative excerpts", { x: 0.4, y: 0.3, fontSize: 16, color: "003349" });
  excerpts.forEach((row, i) => {
    quotes.addText(`${row.entityName} · ${row.stars}★ · ${row.postDate}`, { x: 0.4, y: 0.8 + i * 2.2, fontSize: 12, color: "6B7270" });
    quotes.addText(`“${row.quoteText}”`, { x: 0.4, y: 1.15 + i * 2.2, fontSize: 14, w: 9 });
  });
  if (hero) {
    const next = pptx.addSlide();
    next.addText("Suggested next step", { x: 0.5, y: 0.4, fontSize: 18, color: "003349" });
    next.addText(hero.nextStep.hypothesis, { x: 0.5, y: 1.1, w: 9, fontSize: 16 });
    next.addText(`Owner: ${hero.nextStep.ownerRole}`, { x: 0.5, y: 2.2, fontSize: 14 });
  }
  const method = pptx.addSlide();
  method.addText("Methodology", { x: 0.5, y: 0.4, fontSize: 18, color: "003349" });
  method.addText(
    `Snapshot ${snapshotId}. Dataset ${ctx.datasetVersion}. Overlay ${ctx.overlayRevision}. Category benchmark includes selected brands. n=${radar.meta.distinctReviewN} distinct reviews.`,
    { x: 0.5, y: 1.1, w: 9, fontSize: 14 },
  );
  await pptx.writeFile({ fileName: `buyerswitch-${snapshotId}.pptx` });
}
