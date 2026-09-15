"use client";

import { SentimentPill, Delta, StarRating, SourceTag, EmptyState, Wordmark } from "@/components/brand/primitives";

export default function GalleryPage() {
  return (
    <div className="space-y-6 p-8">
      <Wordmark className="bg-navy p-4" />
      <SentimentPill value={73} bucket={3} />
      <SentimentPill value={0} bucket={1} />
      <SentimentPill value={null} bucket={3} />
      <Delta delta={4} goodDirection="up" unit="percent" />
      <Delta delta={12} goodDirection="neutral" unit="count" />
      <Delta delta={null} reason="Incomplete prior coverage" goodDirection="up" unit="stars" />
      <StarRating value={4.12} />
      <StarRating value={null} />
      <SourceTag name="Amazon CA" />
      <EmptyState title="No findings meet the current evidence and gap thresholds." body="Try a wider date range or fewer filters." />
    </div>
  );
}
