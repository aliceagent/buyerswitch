# Reference — design tokens

Every colour, type and spacing decision in the demo comes from here. **Never hardcode a hex
value in a component.** Sprint 02 wires these into Tailwind theme variables; everything after
that references them by role.

---

## 1. Brand palette (Stagwell)

These are palette values supplied with the plan; confirm against approved assets before public launch. They are for interface chrome, not for data.

| Token | Hex | Used for |
|---|---|---|
| `navy` | `#003349` | Nav rail, page headers, primary text on light |
| `lightblue` | `#009CBD` | Primary actions, links, active states, the volume metric family |
| `marigold` | `#FFB81C` | The Filters control, attention and "needs input" states |
| `white` | `#F5F7F6` | Page background |
| `grey` | `#C5C6C7` | Borders, dividers, disabled |
| `black` | `#212322` | Body text |

Derived neutrals (generate a full scale from `#212322` and `#F5F7F6` in sprint 02):
`surface` `#FFFFFF`, `surface-muted` `#F5F7F6`, `border` `#E3E5E4`, `ink-muted` `#6B7270`.

---

## 2. Typography

| Role | Face | Notes |
|---|---|---|
| UI and data | **Montserrat** | Everything. Load via `next/font/google`, weights 400/500/600/700 |
| Accent / editorial | **Spectral** | Marketing pages only — hero headline, pull quotes. Never in the app. |

Tabular numerals (`font-variant-numeric: tabular-nums`) on **every** table column, axis tick and
KPI value. Proportional figures everywhere else.

Scale: `12 / 13 / 14 / 16 / 20 / 24 / 32 / 48`. The app is dense — body text in the analytics
screens is 13px, not 16px. Marketing pages use the larger end.

---

## 3. The sentiment scale — the most important colour decision in the product

Sentiment is **diverging**: it has a meaningful midpoint (the current view's own average) and
two opposite directions. It therefore uses two hues plus a near-neutral midpoint — warm for
below-average, cool for above-average — never a red-to-green rainbow, which is unreadable for
the ~8% of men with red-green colour vision deficiency.

### Light mode

| Bucket | Meaning | Hex |
|---|---|---|
| 1 | Far below this view's average | `#8F2521` |
| 2 | Below average | `#E0714B` |
| 3 | **At the view's average** | `#DCDCD8` |
| 4 | Above average | `#4D9FC0` |
| 5 | Far above average | `#10495E` |

### Dark mode

| Bucket | Hex |
|---|---|
| 1 | `#F4826D` |
| 2 | `#A03D2B` |
| 3 | `#3A4145` |
| 4 | `#2F7F9B` |
| 5 | `#68D0EF` |

The original plan reported palette accessibility checks. Re-run checks in the implemented UI; this revision does not certify those results.

### How the buckets are computed — read this carefully

The bucket boundaries are **not fixed**. They recentre on the average sentiment of whatever is
currently on screen, so bucket 3 is always exactly the view's own average. Given an average of
`avg`:

```
b1 = round(avg * 0.5)
b4 = avg + floor((100 - avg) * 0.55)

bucket 1: 0      .. b1
bucket 2: b1 + 1 .. avg - 1
bucket 3: avg    .. avg          (the single value)
bucket 4: avg + 1.. b4
bucket 5: b4 + 1 .. 100
```

This reproduces both legends observed in the real product **exactly**, and sprint 02's
acceptance criteria test for them:

| Average | Legend |
|---|---|
| 73% | `0–37 / 38–72 / 73 / 74–87 / 88–100` |
| 86% | `0–43 / 44–85 / 86 / 87–93 / 94–100` |

**Two rules that are not optional:**

1. The legend must state its basis in words — *"shaded relative to this view's average of 73%"* —
   because a scale that moves under the reader is otherwise a trap.
2. There is a **toggle for an absolute 0–100 scale** in the widget overflow menu. Some users want
   comparability across views more than they want local contrast.

### Colour is never the only signal

Every sentiment-coloured element also carries its number in text, and every delta carries a
directional arrow as well as a colour. A screenshot printed in greyscale must still be readable.

---

## 4. Entity / series palette

For charts with one line or bar per product, brand or group — the Comparison time series,
multi-entity overlays.

| Slot | Light | Dark |
|---|---|---|
| 1 | `#009CBD` | `#3FB8D6` |
| 2 | `#EB6834` | `#F07A45` |
| 3 | `#7B5EA7` | `#9B85D6` |
| 4 | `#1BAF7A` | `#2FC98F` |
| 5 | `#EDA100` | `#E0A92A` |

**Assign slots in fixed order and never cycle.** Colour follows the entity, not its rank — if a
user removes the second of three products, the remaining two keep their colours. A sixth entity
is not allowed; the Comparison page caps at five plus Industry.

**The Industry benchmark series** is not a slot. It is always `navy #003349`, always a **dashed**
line, always first in the legend. It is a reference line, not a competitor.

---

## 4b. Sequential ramps (magnitude, not polarity)

Star levels and ranked topic shares are **ordered magnitude**, not polarity, so they use a
single-hue ramp — not the diverging sentiment scale, and not the entity slots.

**Five-step ramp** — the star rating donut (5★ darkest through 1★ lightest):

`#00303F · #00566B · #007C99 · #00A2C7 · #4FBEDB`

**Seven-step ramp** — ranked part-to-whole charts:

`#002C3A · #004356 · #005A72 · #00718E · #0088AA · #12A0C6 · #4FBEDB`

Both are validated: monotone in lightness, visible steps between adjacent slices, and the
lightest step still clears 2:1 against a white surface.

**The seven-step ramp caps the donut at seven slices.** A ten-slice donut cannot be given ten
distinguishable colours — the adjacent pairs fall below the threshold at which a full-colour
reader can tell them apart, never mind a colourblind one. So the "Top 10 topics" widget shows
**the top six plus an "Other" slice**, with all seven directly labelled on leader lines, and a
"view all 10" link opening the ranked list as a table. That is a better chart than the source
product's, and it is the only version that is actually readable.

---

## 4c. Chip and tag tints

Filter chips and source tags are interface chrome, not data, so they draw from the neutral and
brand families rather than the series slots:

| Chip | Background | Text |
|---|---|---|
| Hierarchy | `#EEF1F0` | `#003349` |
| Products | `#EDE9F5` | `#4A3A72` |
| Brands | `#E6F4F8` | `#00566B` |
| Topics | `#FFF3D6` | `#6B4E00` |
| Sources | `#F0F1F1` | `#4D5452` |
| Star rating | `#EAF2F5` | `#00566B` |

Source tags use a single muted style with the retailer name in text — **not** a per-retailer
brand colour, which would put six competitors' brand colours into our interface and make the
table look like a logo wall.

---

## 5. Status and delta colours

| Role | Light | Dark | Used for |
|---|---|---|---|
| Positive delta | `#006300` | `#0CA30C` | ↑ arrows on improving metrics |
| Negative delta | `#C03030` | `#E06A6A` | ↓ arrows on worsening metrics |
| Neutral / N/A | `#6B7270` | `#9AA09E` | no comparison period available |

These are reserved. Never reuse them as a series colour — a green line that means "Brand C"
sitting next to a green arrow that means "improving" is exactly the confusion to avoid.

---

## 6. Chart chrome

| Role | Light | Dark |
|---|---|---|
| Chart surface | `#FFFFFF` | `#1A1F22` |
| Page plane | `#F5F7F6` | `#12171A` |
| Primary ink | `#212322` | `#FFFFFF` |
| Secondary ink | `#4D5452` | `#C2C7C5` |
| Muted (axis, ticks) | `#8A908E` | `#8A908E` |
| Gridline | `#EDEFEE` | `#262C2F` |
| Baseline | `#C5C6C7` | `#3A4145` |

All seven of these are wired as tokens in sprint 02 — not just grid and axis.

Grid and axes are recessive. Bars get 4px rounded ends at the data end only, square at the
baseline. Lines are 2px. Markers are ≥8px. Leave a 2px surface-coloured gap between adjacent
bars and between stacked segments.

---

## 7. One deliberate departure from the source product

The source draws **Volume and Sentiment Over Time** as a dual-axis chart — volume bars on a left
axis, a sentiment line on a right axis. Dual-axis charts let the author imply any correlation
they like by rescaling one axis, and readers cannot tell which line belongs to which scale.

**Build it as a single-axis chart instead:** volume bars on one y-axis, each bar coloured by that
period's sentiment bucket, with the sentiment legend beneath. The metric dropdown switches the
y-axis between Volume and Sentiment rather than showing both at once. This keeps everything the
source communicated — you can still see volume rising while sentiment falls — without the
distortion, and it looks cleaner.

If Jonathan wants the dual-axis version back for fidelity to the reference product, it is a
one-component change. Flag it; do not decide it silently.

---

## 8. Density and spacing

Spacing scale: `2 / 4 / 8 / 12 / 16 / 24 / 32 / 48`.

- Table row height: 44px comfortable, 34px compact. Offer the toggle in the app header.
- Widget cards: 16px padding, 8px radius, 1px `border` hairline, no drop shadow.
- The KPI strip is four equal cards in a row at ≥1024px, two-up below that, stacked on mobile.
- Minimum 16px side gutter at every viewport width.

## Revision 2 rules

Volume deltas use neutral styling. Insufficient evidence and null metrics are distinct from parity/zero. Panel labels come from copy-deck.md. Disclose synthetic data and denominators. Local licensed fonts may replace remote font downloads for reproducible builds. Respect reduced motion.
