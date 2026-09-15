import type { Workspace } from "@/types";
import { DATASET_VERSION, VISIBLE_FROM, VISIBLE_TO } from "@/lib/dates";

export const DEFAULT_WORKSPACE: Workspace = {
  id: "ws-audio-us-ca",
  name: "Audio Devices US + Canada",
  categoryId: "audio-devices",
  market: "US-CA",
  sources: ["amazon", "bestbuy", "walmart", "target", "amazon_ca", "bestbuy_ca"],
  reviewMode: "unique",
  dateRange: { from: VISIBLE_FROM, to: VISIBLE_TO },
  datasetVersion: DATASET_VERSION,
  myBrandId: "tozo",
  competitorBrandIds: ["apple", "sony", "jlab", "jabra"],
};
