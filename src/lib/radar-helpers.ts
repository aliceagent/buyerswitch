import type { RadarFinding } from "@/types";

export function pickHeroFinding(findings: RadarFinding[]): RadarFinding | null {
  const exposure = findings.filter((f) => f.panel === "exposure");
  return (
    exposure.find((f) => f.topicId === "ergonomics") ??
    exposure[0] ??
    findings.find((f) => f.panel === "opportunity") ??
    findings[0] ??
    null
  );
}

export function panelLabel(panel: RadarFinding["panel"]): string {
  if (panel === "strength") return "Relative strength";
  if (panel === "complaint") return "Complaint linked to low ratings";
  if (panel === "opportunity") return "Competitor weakness";
  return "Competitive exposure";
}

export function supportLine(finding: RadarFinding): string {
  const n = finding.denominators.entityN ?? finding.denominators.lowN ?? finding.denominators.competitorN;
  if (!n) return "Insufficient evidence";
  return n >= 30 ? `Supported · ${n.toLocaleString()} distinct reviews` : `Low support · ${n.toLocaleString()} distinct reviews`;
}

export function cleanStatement(statement: string): string {
  return statement.replace(/\s*\(priority heuristic\)\.?/gi, ".").replace(/\.\./g, ".");
}
