import { describe, expect, it } from "vitest";
import { positiveShare, meanStars, mentionShare } from "@/lib/metrics";
import { sentimentBuckets } from "@/lib/chart-colors";
import { priorWindow, inclusiveDayCount } from "@/lib/dates";
import fixture from "../docs/reference/golden-metrics-fixture.json";

describe("golden fixture", () => {
  const uniqueSents = fixture.reviews.flatMap((r) => r.sentiments);
  const allSents = [...uniqueSents, ...fixture.reviews[0]!.sentiments];
  const uniqueStars = fixture.reviews.map((r) => r.stars);
  const allStars = [...uniqueStars, fixture.reviews[0]!.stars];

  it("unique mode", () => {
    expect(fixture.reviews.length).toBe(4);
    expect(positiveShare(uniqueSents as never)).toBe(fixture.expected.unique.positiveShare);
    expect(meanStars(uniqueStars)).toBe(fixture.expected.unique.averageStars);
  });

  it("all mode weights duplicate r1", () => {
    expect(allStars.length).toBe(5);
    expect(positiveShare(allSents as never)).toBe(fixture.expected.all.positiveShare);
    expect(meanStars(allStars)).toBe(fixture.expected.all.averageStars);
  });

  it("audio unique union", () => {
    const mentioning = fixture.reviews.filter((r) => r.topics.includes("audio")).length;
    expect(mentioning).toBe(fixture.expected.audioUnique.mentioningReviews);
    const quotes = fixture.reviews.flatMap((r) =>
      r.topics.map((t, i) => ({ t, s: r.sentiments[i] })).filter((x) => x.t === "audio"),
    );
    expect(quotes.length).toBe(fixture.expected.audioUnique.topicQuotes);
    expect(mentionShare(mentioning, 4)).toBe(fixture.expected.audioUnique.mentionShare);
    expect(positiveShare(quotes.map((q) => q.s) as never)).toBe(fixture.expected.audioUnique.topicPositiveShare);
  });

  it("audio or battery unique", () => {
    const n = fixture.reviews.filter((r) => r.topics.includes("audio") || r.topics.includes("battery")).length;
    expect(n).toBe(fixture.expected.audioOrBatteryUnique.matchingReviews);
  });
});

describe("sentiment buckets", () => {
  it("matches 73 and 86 legends", () => {
    expect(sentimentBuckets(73).ranges).toEqual(["0–37", "38–72", "73", "74–87", "88–100"]);
    expect(sentimentBuckets(86).ranges).toEqual(["0–43", "44–85", "86", "87–93", "94–100"]);
  });
});

describe("prior window", () => {
  it("full visible prior starts 2016-03-02", () => {
    expect(inclusiveDayCount("2019-01-01", "2021-10-31")).toBe(1035);
    expect(priorWindow("2019-01-01", "2021-10-31")).toEqual({ from: "2016-03-02", to: "2018-12-31" });
  });
});
