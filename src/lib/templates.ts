import type { Sentiment } from "@/types";

const POS: Record<string, string[]> = {
  "audio-quality": ["The sound is clear and detailed.", "Audio stays clean even at higher volume."],
  battery: ["Battery easily lasts a full workday.", "Charge holds up well between uses."],
  ergonomics: ["They sit securely without pressing on my ears.", "The fit stays comfortable during long listening."],
  "price-value-for-money": ["For the price, the performance is hard to beat.", "Good value compared with similar options I tried."],
  "life-span": ["Still working after months of daily use.", "Build quality looks like it will last."],
  connectivity: ["Pairs quickly and stays connected.", "Bluetooth reconnects without fuss."],
  default: ["Works as described.", "Average for this category."],
};

const NEG: Record<string, string[]> = {
  "audio-quality": ["The sound turns muddy on busier tracks.", "Audio lacks clarity in the upper range."],
  battery: ["The battery dies after an hour.", "Charge drops much faster than expected."],
  ergonomics: ["The earbuds become uncomfortable after an hour.", "The fit slips and starts to ache."],
  "price-value-for-money": ["Not worth the asking price once you use them daily.", "Cheaper options I own feel more complete."],
  "life-span": ["One side failed after a few weeks.", "The coating wore off almost immediately."],
  connectivity: ["The connection drops every few minutes.", "I have to re-pair them several times a day."],
  default: ["Needs work.", "Would not rely on this daily."],
};

const NEU: Record<string, string[]> = {
  default: ["This feature is acceptable, nothing more.", "Performance here is average for the category."],
};

export function sentenceFor(topicId: string, sentiment: Sentiment, variant: number): string {
  const bag =
    sentiment === "positive" ? POS : sentiment === "negative" ? NEG : NEU;
  const list = bag[topicId] ?? bag.default ?? NEU.default;
  return list[variant % list.length]!;
}
