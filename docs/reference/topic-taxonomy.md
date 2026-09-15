# Audio topic taxonomy — v2

Preserve these 66 leaf-topic IDs and universal/category labels. The table comes from the supplied plan; its underlying recording was not independently checked. Percentages are generation hints, not observed facts in the revised demo. Normalize mention weights when drawing topics; derive actual percentages from records. Rare topics can have no support.

Display “% of reviews mentioning topic”. Shares overlap. The universal bound is sum(mention shares) ≤ quotes-per-review ×100 for the same scope and mode. There is no universal lower bound of 200%.

| # | Topic | Slug | Kind | Share of voice | Sentiment |
|---|---|---|---|---|---|
| 1 | Audio Quality | `audio-quality` | category | 30% | 81% |
| 2 | Overall satisfaction | `overall-satisfaction` | universal | 27% | 89% |
| 3 | Battery | `battery` | category | 20% | 66% |
| 4 | Price/Value for money | `price-value-for-money` | universal | 17% | 76% |
| 5 | Ergonomics | `ergonomics` | category | 14% | 69% |
| 6 | Performance | `performance` | category | 12% | 66% |
| 7 | Connectivity | `connectivity` | category | 12% | 59% |
| 8 | Ease of use | `ease-of-use` | universal | 8% | 86% |
| 9 | Quality | `quality` | universal | 8% | 75% |
| 10 | Is it recommended? | `is-it-recommended` | universal | 8% | 77% |
| 11 | Noise Cancellation | `noise-cancellation` | category | 8% | 64% |
| 12 | Usage Purpose | `usage-purpose` | universal | 8% | 77% |
| 13 | Size | `size` | universal | 6% | 64% |
| 14 | Comfortable | `comfortable` | category | 10% | 81% |
| 15 | Accessories | `accessories` | universal | 7% | 70% |
| 16 | Meets expectations | `meets-expectations` | universal | 6% | 72% |
| 17 | Returning customer | `returning-customer` | universal | 6% | 73% |
| 18 | Life span | `life-span` | universal | 5% | 90% |
| 19 | Music Listening Experience | `music-listening-experience` | category | 5% | 76% |
| 20 | Call Experience | `call-experience` | category | 5% | 90% |
| 21 | Return & refund | `return-and-refund` | universal | 4% | 85% |
| 22 | Bass | `bass` | category | 4% | 73% |
| 23 | Customer service | `customer-service` | universal | 4% | 73% |
| 24 | Compatibility | `compatibility` | universal | 4% | 75% |
| 25 | Volume | `volume` | category | 4% | 90% |
| 26 | Product Defect | `product-defect` | universal | 4% | 15% |
| 27 | Touch Control | `touch-control` | category | 4% | 77% |
| 28 | Waterproof | `waterproof` | category | 4% | 62% |
| 29 | Eartips | `eartips` | category | 4% | 60% |
| 30 | Audio Fidelity | `audio-fidelity` | category | 3.0% | 87% |
| 31 | Specs Comparison | `specs-comparison` | universal | 3.0% | 75% |
| 32 | Time/Frequency of use | `time-frequency-of-use` | universal | 3.0% | 74% |
| 33 | Customer Wishlist | `customer-wishlist` | universal | 3.0% | 19% |
| 34 | Microphone | `microphone` | category | 2.2% | 79% |
| 35 | Settings | `settings` | universal | 2.2% | 78% |
| 36 | Design | `design` | universal | 1.9% | 87% |
| 37 | Volume Control | `volume-control` | category | 1.7% | 60% |
| 38 | Shipping | `shipping` | universal | 1.5% | 55% |
| 39 | Gift purposes | `gift-purposes` | universal | 1.3% | 73% |
| 40 | Packaging | `packaging` | universal | 1.1% | 67% |
| 41 | Warranty | `warranty` | universal | 0.96% | 57% |
| 42 | Instructions | `instructions` | universal | 0.89% | 52% |
| 43 | Weight | `weight` | universal | 0.74% | 76% |
| 44 | Ambient Sounds | `ambient-sounds` | category | 0.65% | 87% |
| 45 | Treble | `treble` | category | 0.56% | 82% |
| 46 | Online shopping | `online-shopping` | universal | 0.49% | 79% |
| 47 | Portability | `portability` | universal | 0.43% | 49% |
| 48 | Material | `material` | universal | 0.37% | 78% |
| 49 | Audio Features | `audio-features` | category | 0.33% | 71% |
| 50 | Speaker Quality | `speaker-quality` | category | 0.28% | 38% |
| 51 | Midrange | `midrange` | category | 0.24% | 73% |
| 52 | Applications | `applications` | category | 0.21% | 79% |
| 53 | Color | `color` | universal | 0.18% | 83% |
| 54 | Loyalty | `loyalty` | universal | 0.16% | 78% |
| 55 | Audiophile | `audiophile` | category | 0.13% | 79% |
| 56 | Voice Recognition | `voice-recognition` | category | 0.11% | 60% |
| 57 | Stereo | `stereo` | category | 0.10% | 78% |
| 58 | Gaming Experience | `gaming-experience` | category | 0.08% | 44% |
| 59 | Item availability | `item-availability` | universal | 0.07% | 88% |
| 60 | Customization | `customization` | category | 0.06% | 75% |
| 61 | Radio | `radio` | category | 0.05% | 52% |
| 62 | Genuine | `genuine` | universal | 0.04% | 49% |
| 63 | 3D Surround Sound | `3d-surround-sound` | category | 0.04% | 49% |
| 64 | Notifications | `notifications` | category | 0.04% | 62% |
| 65 | Smell | `smell` | universal | 0.03% | 15% |
| 66 | Manufacturing country | `manufacturing-country` | universal | 0.03% | 63% |
---


## Seeded Mega Topics

| Name | Leaf members |
|---|---|
| Sound Signature | bass, treble, midrange, stereo, audio-fidelity, 3d-surround-sound |
| Fit & Comfort | ergonomics, comfortable, eartips, size, weight |
| Post-Purchase Experience | shipping, packaging, return-and-refund, warranty, customer-service, item-availability |

Compute quote and parent-review unions, then mode weighting. Mega Topics supplement leaf rows and are excluded from leaf-total reconciliation. Terms cloud derives from eligible quote text. At most 20 terms, counts and table alternative; do not invent terms to fill a sparse cloud.
