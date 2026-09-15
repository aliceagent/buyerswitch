"use client";

import { priorWindow } from "@/lib/dates";
import { sentimentBuckets } from "@/lib/chart-colors";

export default function ConsistencyPage() {
  const prior = priorWindow("2019-01-01", "2021-10-31");
  const b73 = sentimentBuckets(73);
  const b86 = sentimentBuckets(86);
  return (
    <div className="space-y-3 p-8 text-[13px]">
      <h1 className="text-xl font-semibold">Consistency diagnostics</h1>
      <p>Prior window: {prior.from}–{prior.to} {prior.from === "2016-03-02" ? "ok" : "FAIL"}</p>
      <p>73 legend: {b73.ranges.join(" / ")}</p>
      <p>86 legend: {b86.ranges.join(" / ")}</p>
      <p>Run npm test and npm run seed:check for numerical contracts.</p>
    </div>
  );
}
