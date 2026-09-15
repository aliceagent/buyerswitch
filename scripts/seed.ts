import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import {
  DATASET_VERSION,
  HISTORY_FROM,
  HISTORY_TO,
  SEED,
  VISIBLE_FROM,
  VISIBLE_TO,
  addDays,
  parseUtc,
} from "../src/lib/dates";
import { createRng, pick, pickIndex, shuffle } from "../src/lib/prng";
import { LEAF_TOPICS, MEGA_TOPICS, SENTIMENT_HINTS, TOPIC_WEIGHTS } from "../src/lib/taxonomy";
import { sentenceFor } from "../src/lib/templates";
import type {
  Brand,
  DataSource,
  Group,
  Hierarchy,
  Product,
  Quote,
  Review,
  ReviewOccurrence,
  Sentiment,
} from "../src/types";

const OUT = path.join(process.cwd(), "public/data");
const VISIBLE_CANONICAL = 12000;
const HISTORY_CANONICAL = 8000;
const VISIBLE_DUP = 840;
const HISTORY_DUP = 560;

const SOURCES: DataSource[] = [
  { slug: "amazon", name: "Amazon", country: "US" },
  { slug: "bestbuy", name: "Best Buy", country: "US" },
  { slug: "walmart", name: "Walmart", country: "US" },
  { slug: "target", name: "Target", country: "US" },
  { slug: "amazon_ca", name: "Amazon CA", country: "CA" },
  { slug: "bestbuy_ca", name: "Best Buy CA", country: "CA" },
];

const ALL_SOURCES = SOURCES.map((s) => s.slug);

const HIERARCHY: Hierarchy[] = [
  { id: "audio-devices", name: "Audio Devices", parentId: null },
  { id: "wireless-earphones", name: "Wireless Earphones", parentId: "audio-devices" },
  { id: "wireless-headphones", name: "Wireless Headphones", parentId: "audio-devices" },
  { id: "wired-headphones", name: "Wired Headphones", parentId: "audio-devices" },
  { id: "wired-earphones", name: "Wired Earphones", parentId: "audio-devices" },
];

const BRAND_NAMES: { id: string; name: string }[] = [
  { id: "apple", name: "Apple" },
  { id: "sony", name: "Sony" },
  { id: "tozo", name: "TOZO" },
  { id: "jlab", name: "JLab" },
  { id: "jabra", name: "Jabra" },
  { id: "bose", name: "Bose" },
  { id: "beats", name: "Beats" },
  { id: "sennheiser", name: "Sennheiser" },
  { id: "samsung", name: "Samsung" },
  { id: "google", name: "Google" },
  { id: "anker", name: "Anker" },
  { id: "soundcore", name: "Soundcore" },
  { id: "skullcandy", name: "Skullcandy" },
  { id: "jbl", name: "JBL" },
  { id: "audio-technica", name: "Audio-Technica" },
  { id: "panasonic", name: "Panasonic" },
  { id: "philips", name: "Philips" },
  { id: "logitech", name: "Logitech" },
  { id: "razer", name: "Razer" },
  { id: "hyperx", name: "HyperX" },
  { id: "plantronics", name: "Plantronics" },
  { id: "shure", name: "Shure" },
  { id: "beyerdynamic", name: "Beyerdynamic" },
  { id: "marshall", name: "Marshall" },
  { id: "bang-olufsen", name: "Bang & Olufsen" },
  { id: "nothing", name: "Nothing" },
  { id: "oneplus", name: "OnePlus" },
  { id: "xiaomi", name: "Xiaomi" },
  { id: "haylou", name: "Haylou" },
  { id: "qcy", name: "QCY" },
  { id: "edifier", name: "Edifier" },
  { id: "creative", name: "Creative" },
  { id: "koss", name: "Koss" },
  { id: "grado", name: "Grado" },
  { id: "audeze", name: "Audeze" },
  { id: "focal", name: "Focal" },
  { id: "yamaha", name: "Yamaha" },
  { id: "pioneer", name: "Pioneer" },
  { id: "onkyo", name: "Onkyo" },
  { id: "tribit", name: "Tribit" },
];

const LEAVES = ["wireless-earphones", "wireless-headphones", "wired-headphones", "wired-earphones"];
const TOPIC_IDS = LEAF_TOPICS.map((t) => t.id);
const TOPIC_W = TOPIC_IDS.map((id) => TOPIC_WEIGHTS[id] ?? 1);

function sha256(buf: Buffer | string): string {
  return createHash("sha256").update(buf).digest("hex");
}

function makeBrands(): Brand[] {
  return BRAND_NAMES.map((b) => ({
    id: b.id,
    name: b.name,
    logoUrl: `/images/brands/${b.id}.svg`,
  }));
}

function makeProducts(rng: () => number): Product[] {
  const products: Product[] = [];
  const anchors: Product[] = [
    {
      id: "airpods-charging-case",
      title: "AirPods with Charging Case",
      shortTitle: "AirPods",
      brandId: "apple",
      hierarchyId: "wireless-earphones",
      source: "amazon",
      firstReviewDate: "2019-03-28",
      imageUrl: "/images/products/airpods.svg",
      sourceUrl: null,
    },
    {
      id: "airpods-pro",
      title: "AirPods Pro",
      shortTitle: "AirPods Pro",
      brandId: "apple",
      hierarchyId: "wireless-earphones",
      source: "amazon",
      firstReviewDate: "2019-10-30",
      imageUrl: "/images/products/airpods-pro.svg",
      sourceUrl: null,
    },
    {
      id: "jlab-jbuds-air",
      title: "JLab JBuds Air",
      shortTitle: "JBuds Air",
      brandId: "jlab",
      hierarchyId: "wireless-earphones",
      source: "amazon",
      firstReviewDate: "2019-01-02",
      imageUrl: "/images/products/jbuds.svg",
      sourceUrl: null,
    },
    {
      id: "jabra-elite-65t",
      title: "Jabra Elite 65t",
      shortTitle: "Elite 65t",
      brandId: "jabra",
      hierarchyId: "wireless-earphones",
      source: "amazon",
      firstReviewDate: "2019-01-01",
      imageUrl: "/images/products/elite.svg",
      sourceUrl: null,
    },
    {
      id: "tozo-t10",
      title: "TOZO T10 Wireless Earbuds",
      shortTitle: "T10",
      brandId: "tozo",
      hierarchyId: "wireless-earphones",
      source: "amazon",
      firstReviewDate: "2021-03-24",
      imageUrl: "/images/products/t10.svg",
      sourceUrl: null,
    },
  ];
  products.push(...anchors);

  const models: Record<string, string[]> = {
    apple: ["AirPods Max", "EarPods"],
    sony: ["WF-1000XM3", "WH-1000XM4", "WI-C200", "MDR-ZX110"],
    tozo: ["T6", "NC9", "OpenBuds"],
    jlab: ["Go Air", "Studio ANC", "JBuds Wired"],
    jabra: ["Elite 75t", "Elite 85h"],
    bose: ["QuietComfort Earbuds", "QC35 II"],
    beats: ["Studio Buds", "Solo3"],
    sennheiser: ["Momentum True Wireless", "HD 599"],
    samsung: ["Galaxy Buds+", "AKG Wired"],
    google: ["Pixel Buds"],
    anker: ["Soundcore Life P2"],
    soundcore: ["Liberty Air 2"],
    skullcandy: ["Indy", "Crusher Wireless"],
    jbl: ["Tune 225", "Live 650BT"],
    "audio-technica": ["ATH-M50x", "ATH-CKS5TW"],
    panasonic: ["RP-HJE120"],
    philips: ["SHP9500"],
    logitech: ["G Pro X"],
    razer: ["Hammerhead TWS"],
    hyperx: ["Cloud II"],
    plantronics: ["BackBeat Pro"],
    shure: ["AONIC 215"],
    beyerdynamic: ["DT 770"],
    marshall: ["Major IV"],
    "bang-olufsen": ["Beoplay E8"],
    nothing: ["Ear (1)"],
    oneplus: ["Buds Z"],
    xiaomi: ["Redmi Buds 3"],
    haylou: ["GT1"],
    qcy: ["T5"],
    edifier: ["W820NB"],
    creative: ["Outlier Air"],
    koss: ["Porta Pro"],
    grado: ["SR80e"],
    audeze: ["LCD-1"],
    focal: ["Listen Wireless"],
    yamaha: ["HPH-150"],
    pioneer: ["SE-MS5T"],
    onkyo: ["IE-C1"],
    tribit: ["FlyBuds"],
  };

  const hierFor = (name: string, brand: string): string => {
    const n = name.toLowerCase();
    if (n.includes("wired") || n.includes("earpods") || n.includes("m50x") || n.includes("770") || n.includes("sr80") || n.includes("zx110") || n.includes("hje") || n.includes("shp") || n.includes("porta") || n.includes("lcd") || n.includes("hph") || n.includes("ms5") || n.includes("c1")) {
      return n.includes("bud") || n.includes("ie-") || n.includes("hje") || n.includes("earpod") || n.includes("aonic")
        ? "wired-earphones"
        : "wired-headphones";
    }
    if (n.includes("max") || n.includes("wh-") || n.includes("qc35") || n.includes("solo") || n.includes("650") || n.includes("cloud") || n.includes("pro x") || n.includes("major") || n.includes("backbeat") || n.includes("w820") || n.includes("listen")) {
      return "wireless-headphones";
    }
    if (brand === "apple" && name === "EarPods") return "wired-earphones";
    return "wireless-earphones";
  };

  let n = 0;
  for (const brand of BRAND_NAMES) {
    const list = models[brand.id] ?? [`${brand.name} Audio 1`];
    for (const model of list) {
      if (products.length >= 100) break;
      const source = ALL_SOURCES[n % ALL_SOURCES.length]!;
      n += 1;
      const id = `${brand.id}-${model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${source}`;
      if (products.some((p) => p.id === id)) continue;
      const hierarchyId = hierFor(model, brand.id);
      const first =
        brand.id === "tozo" && model === "T6" ? "2018-06-01" : "2016-04-15";
      products.push({
        id,
        title: `${brand.name} ${model}`,
        shortTitle: model,
        brandId: brand.id,
        hierarchyId,
        source,
        firstReviewDate: first,
        imageUrl: `/images/products/generic.svg`,
        sourceUrl: null,
      });
    }
    if (products.length >= 100) break;
  }

  while (products.length < 100) {
    const brand = pick(rng, BRAND_NAMES);
    const source = pick(rng, ALL_SOURCES);
    const hierarchyId = pick(rng, LEAVES);
    const id = `${brand.id}-extra-${products.length}-${source}`;
    products.push({
      id,
      title: `${brand.name} Audio ${products.length}`,
      shortTitle: `Audio ${products.length}`,
      brandId: brand.id,
      hierarchyId,
      source,
      firstReviewDate: "2016-05-01",
      imageUrl: `/images/products/generic.svg`,
      sourceUrl: null,
    });
  }
  return products.slice(0, 100);
}

function composeReview(
  id: string,
  product: Product,
  postDate: string,
  stars: 1 | 2 | 3 | 4 | 5,
  quotesSpec: { topicId: string; sentiment: Sentiment; text?: string; confidence?: number }[],
  extraPrefix = "",
): Review {
  const parts: string[] = [];
  if (extraPrefix) parts.push(extraPrefix);
  const quoteTexts = quotesSpec.map((q, i) => q.text ?? sentenceFor(q.topicId, q.sentiment, i));
  parts.push(...quoteTexts);
  const text = parts.join(" ");
  let searchFrom = extraPrefix ? extraPrefix.length + 1 : 0;
  const quotes: Quote[] = quotesSpec.map((q, i) => {
    const qtext = quoteTexts[i]!;
    const idx = text.indexOf(qtext, searchFrom);
    const charStart = idx >= 0 ? idx : searchFrom;
    const charEnd = charStart + qtext.length;
    searchFrom = charEnd;
    return {
      id: `${id}-q${i + 1}`,
      topicId: q.topicId,
      sentiment: q.sentiment,
      text: qtext,
      charStart,
      charEnd,
      confidence: q.confidence ?? 0.82,
      provenance: "synthetic",
    };
  });
  return {
    id,
    productId: product.id,
    source: product.source,
    postDate,
    stars,
    text,
    isPromoted: false,
    sourceUrl: null,
    provenance: "synthetic",
    quotes,
  };
}

function randomDate(rng: () => number, from: string, to: string, notBefore?: string): string {
  const startIso = notBefore && parseUtc(notBefore) > parseUtc(from) ? notBefore : from;
  const start = parseUtc(startIso);
  const end = parseUtc(to);
  if (end < start) return startIso;
  const span = Math.floor((end - start) / 86400000);
  return addDays(startIso, Math.floor(rng() * (span + 1)));
}

function pickTopics(rng: () => number, count: number, forced?: string[]): string[] {
  const out = [...(forced ?? [])];
  while (out.length < count) {
    const id = TOPIC_IDS[pickIndex(rng, TOPIC_W)]!;
    out.push(id);
  }
  return out.slice(0, count);
}

function sentimentForTopic(rng: () => number, topicId: string, bias = 0): Sentiment {
  const hint = (SENTIMENT_HINTS[topicId] ?? 70) / 100 + bias;
  const p = Math.min(0.92, Math.max(0.08, hint));
  const r = rng();
  if (r < p * 0.82) return "positive";
  if (r < p * 0.82 + 0.08) return "neutral";
  return "negative";
}

function starsFromQuotes(rng: () => number, sentiments: Sentiment[]): 1 | 2 | 3 | 4 | 5 {
  const pos = sentiments.filter((s) => s === "positive").length;
  const neg = sentiments.filter((s) => s === "negative").length;
  if (pos > neg) return (rng() < 0.55 ? 5 : 4) as 4 | 5;
  if (neg > pos) return (rng() < 0.55 ? 1 : 2) as 1 | 2;
  return (rng() < 0.5 ? 3 : 4) as 3 | 4;
}

function productsBy(products: Product[], brandId: string, hierarchyId?: string): Product[] {
  return products.filter(
    (p) => p.brandId === brandId && (!hierarchyId || p.hierarchyId === hierarchyId),
  );
}

function generate(): {
  reviews: Review[];
  occurrences: ReviewOccurrence[];
  products: Product[];
  fixtures: Record<string, unknown>;
} {
  const rng = createRng(SEED);
  const products = makeProducts(rng);
  const reviews: Review[] = [];
  const reservedIds = new Set<string>();

  const t10 = products.find((p) => p.id === "tozo-t10")!;
  const airpods = products.find((p) => p.id === "airpods-charging-case")!;
  const airpodsPro = products.find((p) => p.id === "airpods-pro")!;

  const mixedA = composeReview(
    "rev-mixed-a",
    t10,
    "2021-06-12",
    2,
    [
      { topicId: "audio-quality", sentiment: "positive", text: "The sound is clear and detailed." },
      { topicId: "battery", sentiment: "negative", text: "The battery dies after an hour." },
    ],
  );
  const mixedB = composeReview(
    "rev-mixed-b",
    t10,
    "2021-07-08",
    5,
    [
      { topicId: "audio-quality", sentiment: "positive", text: "I love the sound and would buy these again." },
      { topicId: "ergonomics", sentiment: "negative", text: "The earbuds become uncomfortable after an hour." },
    ],
  );
  const qaWrong = composeReview(
    "rev-qa-connectivity",
    t10,
    "2021-05-03",
    2,
    [
      {
        topicId: "connectivity",
        sentiment: "positive",
        text: "The connection drops every few minutes.",
        confidence: 0.35,
      },
    ],
  );
  const emoji = composeReview(
    "rev-emoji",
    t10,
    "2021-08-19",
    4,
    [
      { topicId: "audio-quality", sentiment: "positive", text: "Clear mids and a fun 👍 bass lift." },
      { topicId: "battery", sentiment: "neutral", text: "Charge is acceptable for commuting." },
    ],
    "Quick note: ",
  );
  const repeatedTopic = composeReview(
    "rev-repeated-topic",
    t10,
    "2021-04-02",
    4,
    [
      { topicId: "audio-quality", sentiment: "positive" },
      { topicId: "audio-quality", sentiment: "neutral" },
      { topicId: "battery", sentiment: "negative" },
    ],
  );
  const zeroScope = composeReview(
    "rev-neutral-only",
    products.find((p) => p.brandId === "grado")!,
    "2020-02-02",
    3,
    [
      { topicId: "smell", sentiment: "neutral" },
      { topicId: "manufacturing-country", sentiment: "neutral" },
    ],
  );

  const authored = [mixedA, mixedB, qaWrong, emoji, repeatedTopic, zeroScope];
  reviews.push(...authored);
  authored.forEach((r) => reservedIds.add(r.id));

  let seq = 1;
  const addBatch = (opts: {
    count: number;
    products: Product[];
    from: string;
    to: string;
    forcedTopics?: string[];
    sentimentBias?: Record<string, number>;
    forcedSentiment?: Record<string, Sentiment>;
    forceStars?: 1 | 2 | 3 | 4 | 5;
    prefix?: string;
  }) => {
    const pool = (opts.products.length ? opts.products : products).filter(
      (p) => parseUtc(p.firstReviewDate) <= parseUtc(opts.to),
    );
    const eligible = pool.length ? pool : products.filter((p) => parseUtc(p.firstReviewDate) <= parseUtc(opts.to));
    for (let i = 0; i < opts.count; i += 1) {
      const product = eligible[i % eligible.length]!;
      const from =
        parseUtc(product.firstReviewDate) > parseUtc(opts.from) ? product.firstReviewDate : opts.from;
      const to = opts.to;
      if (parseUtc(from) > parseUtc(to)) {
        throw new Error(`No valid date window for ${product.id} ${from} ${to}`);
      }
      const nQuotes = 2;
      const topics = pickTopics(rng, nQuotes, opts.forcedTopics);
      if (opts.forcedTopics) {
        for (const t of opts.forcedTopics) {
          if (!topics.includes(t)) topics[0] = t;
        }
      }
      const sentiments = topics.map((t) => {
        if (opts.forcedSentiment?.[t]) return opts.forcedSentiment[t]!;
        return sentimentForTopic(rng, t, opts.sentimentBias?.[t] ?? 0);
      });
      const stars = opts.forceStars ?? starsFromQuotes(rng, sentiments);
      const id = `${opts.prefix ?? "rev"}-${String(seq).padStart(5, "0")}`;
      seq += 1;
      reviews.push(
        composeReview(
          id,
          product,
          randomDate(rng, from, to, product.firstReviewDate),
          stars,
          topics.map((topicId, qi) => ({ topicId, sentiment: sentiments[qi]! })),
        ),
      );
    }
  };

  const tozoWE = productsBy(products, "tozo", "wireless-earphones");
  const appleWE = productsBy(products, "apple", "wireless-earphones");
  const sonyWE = productsBy(products, "sony", "wireless-earphones");
  const jlabWE = productsBy(products, "jlab", "wireless-earphones");
  const jabraWE = productsBy(products, "jabra", "wireless-earphones");

  addBatch({
    count: 220,
    products: tozoWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["ergonomics"],
    forcedSentiment: { ergonomics: "negative" },
    prefix: "tozo-erg-n",
  });
  addBatch({
    count: 40,
    products: tozoWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["ergonomics"],
    forcedSentiment: { ergonomics: "positive" },
    prefix: "tozo-erg-p",
  });
  addBatch({
    count: 200,
    products: appleWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["ergonomics"],
    forcedSentiment: { ergonomics: "positive" },
    prefix: "apple-erg-p",
  });
  addBatch({
    count: 30,
    products: appleWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["ergonomics"],
    forcedSentiment: { ergonomics: "negative" },
    prefix: "apple-erg-n",
  });
  addBatch({
    count: 80,
    products: sonyWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["ergonomics"],
    prefix: "sony-erg",
  });
  addBatch({
    count: 80,
    products: jlabWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["ergonomics"],
    prefix: "jlab-erg",
  });
  addBatch({
    count: 80,
    products: jabraWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["ergonomics"],
    prefix: "jabra-erg",
  });

  addBatch({
    count: 180,
    products: tozoWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["price-value-for-money"],
    forcedSentiment: { "price-value-for-money": "positive" },
    prefix: "tozo-price-p",
  });
  addBatch({
    count: 160,
    products: sonyWE.length ? sonyWE : productsBy(products, "sony"),
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["price-value-for-money"],
    forcedSentiment: { "price-value-for-money": "negative" },
    prefix: "sony-price-n",
  });
  addBatch({
    count: 80,
    products: appleWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["price-value-for-money"],
    sentimentBias: { "price-value-for-money": -0.15 },
    prefix: "apple-price",
  });

  addBatch({
    count: 90,
    products: tozoWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["life-span"],
    forcedSentiment: { "life-span": "negative" },
    forceStars: 1,
    prefix: "tozo-life-low",
  });
  addBatch({
    count: 90,
    products: tozoWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forceStars: 5,
    prefix: "tozo-life-high",
  });

  addBatch({
    count: 70,
    products: tozoWE,
    from: "2021-09-01",
    to: "2021-09-30",
    forcedTopics: ["ergonomics"],
    forcedSentiment: { ergonomics: "positive" },
    prefix: "tozo-sep-erg",
  });
  addBatch({
    count: 70,
    products: tozoWE,
    from: "2021-10-01",
    to: "2021-10-31",
    forcedTopics: ["ergonomics"],
    forcedSentiment: { ergonomics: "negative" },
    prefix: "tozo-oct-erg",
  });

  addBatch({
    count: 40,
    products: tozoWE,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    forcedTopics: ["audio-quality", "battery"],
    prefix: "tozo-audio",
  });

  const remainingVisible = VISIBLE_CANONICAL - reviews.length;
  addBatch({
    count: remainingVisible,
    products,
    from: VISIBLE_FROM,
    to: VISIBLE_TO,
    prefix: "vis",
  });

  const visible = reviews.filter((r) => r.postDate >= VISIBLE_FROM && r.postDate <= VISIBLE_TO);
  if (visible.length !== VISIBLE_CANONICAL) {
    throw new Error(`visible canonical ${visible.length} != ${VISIBLE_CANONICAL}`);
  }

  const historyStartCount = reviews.length;
  addBatch({
    count: HISTORY_CANONICAL,
    products: products.filter((p) => p.id !== "tozo-t10"),
    from: HISTORY_FROM,
    to: HISTORY_TO,
    prefix: "his",
  });
  const history = reviews.slice(historyStartCount);
  if (history.length !== HISTORY_CANONICAL) {
    throw new Error(`history canonical ${history.length} != ${HISTORY_CANONICAL}`);
  }

  const occurrences: ReviewOccurrence[] = [];
  for (const r of reviews) {
    occurrences.push({
      id: `occ-${r.id}`,
      canonicalReviewId: r.id,
      isDuplicate: false,
    });
  }
  const visReviews = reviews.filter((r) => r.postDate >= VISIBLE_FROM);
  const hisReviews = reviews.filter((r) => r.postDate < VISIBLE_FROM);
  const visDupSrc = shuffle(rng, visReviews).slice(0, VISIBLE_DUP);
  visDupSrc.forEach((r, i) => {
    occurrences.push({
      id: `occ-dup-v-${i}-${r.id}`,
      canonicalReviewId: r.id,
      isDuplicate: true,
    });
  });
  const hisDupSrc = shuffle(rng, hisReviews).slice(0, HISTORY_DUP);
  hisDupSrc.forEach((r, i) => {
    occurrences.push({
      id: `occ-dup-h-${i}-${r.id}`,
      canonicalReviewId: r.id,
      isDuplicate: true,
    });
  });

  const firstByProduct = new Map<string, string>();
  for (const r of reviews) {
    const prev = firstByProduct.get(r.productId);
    if (!prev || r.postDate < prev) firstByProduct.set(r.productId, r.postDate);
  }
  for (const p of products) {
    p.firstReviewDate = firstByProduct.get(p.id) ?? p.firstReviewDate;
  }
  const t10First = reviews.filter((r) => r.productId === "tozo-t10").map((r) => r.postDate).sort()[0];
  if (t10First !== "2021-03-24" && t10) {
    const earliest = reviews.find((r) => r.productId === "tozo-t10" && r.id === "rev-repeated-topic");
    if (earliest) earliest.postDate = "2021-03-24";
    t10.firstReviewDate = "2021-03-24";
    const others = reviews.filter((r) => r.productId === "tozo-t10" && r.postDate < "2021-03-24");
    for (const r of others) r.postDate = "2021-03-24";
  }
  airpods.firstReviewDate = reviews
    .filter((r) => r.productId === airpods.id)
    .map((r) => r.postDate)
    .sort()[0] ?? airpods.firstReviewDate;
  airpodsPro.firstReviewDate = reviews
    .filter((r) => r.productId === airpodsPro.id)
    .map((r) => r.postDate)
    .sort()[0] ?? airpodsPro.firstReviewDate;

  const overlappingA = products.filter((p) => p.hierarchyId === "wireless-earphones").slice(0, 8).map((p) => p.id);
  const overlappingB = products.filter((p) => p.hierarchyId === "wireless-earphones").slice(4, 12).map((p) => p.id);

  const fixtures = {
    mixedA: { id: mixedA.id, productId: "tozo-t10" },
    mixedB: { id: mixedB.id, productId: "tozo-t10" },
    qaError: {
      id: qaWrong.id,
      quoteId: qaWrong.quotes[0]!.id,
      expectedSentiment: "negative",
      seededSentiment: "positive",
      topicId: "connectivity",
      purpose: "intentionally-wrong-classification",
      excludeFromRadarUntilCorrected: true,
    },
    emoji: { id: emoji.id },
    repeatedTopic: { id: repeatedTopic.id },
    neutralOnly: { id: zeroScope.id },
    overlappingGroups: {
      a: overlappingA,
      b: overlappingB,
    },
    narrativeScope: {
      hierarchyId: "wireless-earphones",
      sources: ALL_SOURCES,
      mode: "unique",
      from: VISIBLE_FROM,
      to: VISIBLE_TO,
      focalBrand: "tozo",
      competitors: ["apple", "sony", "jlab", "jabra"],
    },
    monthlyAlert: { from: "2021-10-01", to: "2021-10-31", brandId: "tozo", topicId: "ergonomics" },
    recoveryView: { from: "2021-01-01", to: "2021-06-30", brandIds: ["tozo"] },
    lowSupportView: {
      from: "2021-10-20",
      to: "2021-10-31",
      brandIds: ["tozo"],
      sources: ["target"],
      topicIds: ["smell"],
    },
  };

  return { reviews, occurrences, products, fixtures };
}

function seedGroups(products: Product[]): Group[] {
  return [
    {
      id: "g-airpods-family",
      name: "AirPods family",
      productIds: products.filter((p) => p.brandId === "apple" && p.title.toLowerCase().includes("airpods")).map((p) => p.id),
    },
    {
      id: "g-budget-audio",
      name: "Budget audio examples",
      productIds: products.filter((p) => p.brandId === "tozo" || p.brandId === "jlab").map((p) => p.id),
    },
  ];
}

function writeJson(file: string, data: unknown): Buffer {
  const buf = Buffer.from(JSON.stringify(data));
  writeFileSync(path.join(OUT, file), buf);
  return buf;
}

function brandSvg(name: string, fill: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${fill}"/><text x="32" y="38" text-anchor="middle" fill="#F5F7F6" font-size="14" font-family="Montserrat,sans-serif">${name.slice(0, 3).toUpperCase()}</text></svg>`;
}

function productSvg(label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="16" fill="#003349"/><circle cx="32" cy="48" r="14" fill="#009CBD"/><circle cx="64" cy="48" r="14" fill="#FFB81C"/><text x="48" y="84" text-anchor="middle" fill="#F5F7F6" font-size="10" font-family="Montserrat,sans-serif">${label}</text></svg>`;
}

function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(path.join(process.cwd(), "public/images/brands"), { recursive: true });
  mkdirSync(path.join(process.cwd(), "public/images/products"), { recursive: true });
  const { reviews, occurrences, products, fixtures } = generate();
  const brands = makeBrands();
  for (const b of brands) {
    writeFileSync(
      path.join(process.cwd(), "public/images/brands", `${b.id}.svg`),
      brandSvg(b.name, "#003349"),
    );
  }
  writeFileSync(path.join(process.cwd(), "public/images/products/airpods.svg"), productSvg("AirPods"));
  writeFileSync(path.join(process.cwd(), "public/images/products/airpods-pro.svg"), productSvg("Pro"));
  writeFileSync(path.join(process.cwd(), "public/images/products/jbuds.svg"), productSvg("JBuds"));
  writeFileSync(path.join(process.cwd(), "public/images/products/elite.svg"), productSvg("Elite"));
  writeFileSync(path.join(process.cwd(), "public/images/products/t10.svg"), productSvg("T10"));
  writeFileSync(path.join(process.cwd(), "public/images/products/generic.svg"), productSvg("Audio"));

  const entities = {
    sources: SOURCES,
    hierarchy: HIERARCHY,
    brands,
    listings: products,
    seedGroups: seedGroups(products),
  };
  const topics = {
    leaves: LEAF_TOPICS.map((t) => ({ ...t, isMega: false })),
    mega: MEGA_TOPICS,
  };

  const reviewsForDisk = reviews.map((r) => ({
    ...r,
    quotes: r.quotes.map(({ text: _text, ...q }) => q),
  }));
  const entitiesBuf = writeJson("entities.json", entities);
  const topicsBuf = writeJson("topics.json", topics);
  const reviewsBuf = writeJson("reviews.json", { reviews: reviewsForDisk });
  const occBuf = writeJson("occurrences.json", { occurrences });
  const fixturesBuf = writeJson("fixtures.json", fixtures);
  const hashes = {
    "entities.json": sha256(entitiesBuf),
    "topics.json": sha256(topicsBuf),
    "reviews.json": sha256(reviewsBuf),
    "occurrences.json": sha256(occBuf),
    "fixtures.json": sha256(fixturesBuf),
  };
  const manifest = {
    schemaVersion: 2,
    datasetVersion: DATASET_VERSION,
    seed: SEED,
    coverage: "Synthetic demo data · Jan 2019–Oct 2021",
    visibleWindow: { from: VISIBLE_FROM, to: VISIBLE_TO },
    historyWindow: { from: HISTORY_FROM, to: HISTORY_TO },
    totals: {
      visibleCanonical: reviews.filter((r) => r.postDate >= VISIBLE_FROM).length,
      visibleOccurrences:
        occurrences.filter((o) => {
          const r = reviews.find((x) => x.id === o.canonicalReviewId)!;
          return r.postDate >= VISIBLE_FROM;
        }).length,
      historyCanonical: reviews.filter((r) => r.postDate < VISIBLE_FROM).length,
      historyOccurrences: occurrences.filter((o) => {
        const r = reviews.find((x) => x.id === o.canonicalReviewId)!;
        return r.postDate < VISIBLE_FROM;
      }).length,
      visibleDuplicates: VISIBLE_DUP,
      historyDuplicates: HISTORY_DUP,
    },
    hashes,
    generatedAt: "deterministic",
  };
  writeJson("manifest.json", manifest);

  const sizes = ["entities.json", "topics.json", "reviews.json", "occurrences.json", "fixtures.json", "manifest.json"].map(
    (f) => {
      const raw = readFileSync(path.join(OUT, f));
      return { f, bytes: raw.length, gz: gzipSync(raw).length };
    },
  );
  const total = sizes.reduce((a, s) => a + s.bytes, 0);
  const gz = gzipSync(
    Buffer.concat(sizes.map((s) => readFileSync(path.join(OUT, s.f)))),
  ).length;
  console.log(JSON.stringify({ sizes, total, gz, reviews: reviews.length, occurrences: occurrences.length }, null, 2));
}

main();
