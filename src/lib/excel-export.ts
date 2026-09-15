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
  findings.addRow(["panel", "topic", "statement", "priority", "n"]);
  for (const f of radar.data.findings) {
    findings.addRow([
      asExcelText(f.panel),
      asExcelText(f.topicId),
      asExcelText(f.statement),
      f.priorityScore,
      f.denominators.entityN ?? 0,
    ]);
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
