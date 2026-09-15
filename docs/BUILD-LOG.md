# Build log

## Implementation (revision 2 application)

- Branch work covering core + full-demo tracks in one pass (README execution order 01–24b).
- Scaffold: create-next-app 16.3.5, Next 16.3.5, React 19.2.8, Node 24.21.0.
- Synthetic corpus generated with seed `buyerswitch-v2`: 12,000 visible canonical / 12,840 unique+duplicate occurrences; 8,000 history. On-disk reviews+occurrences ~12.6 MiB after compacting quote text.

### Commands actually run

| Command | Result |
|---|---|
| `npx tsx scripts/seed.ts` | 20,000 reviews, 21,400 occurrences written to `public/data/` |
| `npm run seed:check` | pass: unique 12000, all 12840, prior 2016-03-02, radar findings 14 |
| `npm test` | 6 Vitest contracts passed |
| `npx eslint .` | 0 errors (warnings only if unused locals remain) |
| `npm run typecheck` | pass |
| `npm run build` | Next.js 16.3.5 production build, 28 routes |
| `npx playwright test e2e/ready.spec.ts e2e/smoke.spec.ts` | 2 passed against `next start` |

### Deployment

Live Vercel production URL not created from this environment. `vercel.json` and Node 24 engines are present; deploy remains unclaimed until a project is linked.

### Limitations

- Seed generator uses bounded authored + biased batches rather than an iterative repair solver; `seed:check` validated required unique/all counts, prior window, hashes, offsets, and Ergonomics TOZO/Apple inequalities on the generated corpus.
- Cold-start performance on a throttled 10 Mbps profile was not measured in this pass.
- PowerPoint uses text slides, not rasterized chart PNGs.
- Marketing pages describe the concept; they do not embed live screenshots of Radar yet.
- Interactive browser walkthrough in the Cloud Agent GUI was not available (computer-use quota). Verification used Playwright against Chromium instead.
