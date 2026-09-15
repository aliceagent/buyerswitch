"use client";

import type { ComparisonSpec, FilterState, QueryContext } from "@/types";
import { query } from "@/lib/query";
import { asExcelText, sanitizeSheetName } from "@/lib/format";

export async function exportExcel(ctx: QueryContext, filter: FilterState, cmp: string[]): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  await query.ensure();
  const snapshotId = `snap-${Date.now()}`;
  const kpis = query.getKpis(ctx, filter);
  const radar = query.getSwitchRadar(ctx, filter, { entityIds: cmp } satisfies ComparisonSpec);
  const wb = new ExcelJS.Workbook();
  const used = new Set<string>();
  const cover = wb.addWorksheet(sanitizeSheetName("Cover", used));
  cover.addRow(["Synthetic demo — illustrative findings; not evidence of real brand performance"]);
  cover.addRow(["Mode", ctx.workspace.reviewMode]);
  cover.addRow(["Window", `${filter.dateFrom}–${filter.dateTo}`]);
  cover.addRow(["Benchmark", "Category benchmark — includes selected brands"]);
  cover.addRow(["Dataset", ctx.datasetVersion]);
  cover.addRow(["Overlay", ctx.overlayRevision]);
  cover.addRow(["Snapshot", snapshotId]);
  cover.addRow(["Reviews in scope", kpis.meta.reviewUnits]);
  cover.addRow(["Distinct reviews", kpis.meta.distinctReviewN]);
  const findings = wb.addWorksheet(sanitizeSheetName("Findings", used));
  findings.addRow(["panel", "topic", "statement", "n"]);
  for (const f of radar.data.findings) {
    findings.addRow([
      asExcelText(f.panel),
      asExcelText(f.topicId),
      asExcelText(f.statement),
      f.denominators.entityN ?? 0,
    ]);
  }
  const excerpts = wb.addWorksheet(sanitizeSheetName("Excerpts", used));
  excerpts.addRow(["entity", "stars", "date", "source", "quote"]);
  const hero = radar.data.findings.find((f) => f.panel === "exposure") ?? radar.data.findings[0];
  if (hero) {
    for (const row of query.getEvidencePack(hero).slice(0, 4)) {
      excerpts.addRow([row.entityName, row.stars, row.postDate, row.source, asExcelText(row.quoteText)]);
    }
  }
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `buyerswitch-${snapshotId}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
