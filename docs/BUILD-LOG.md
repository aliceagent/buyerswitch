# Build log

## Implementation (revision 2 application)

- Branch work covering core + full-demo tracks in one pass (README execution order 01–24b).
- Scaffold: create-next-app 16.3.5, Next 16.3.5, React 19.2.8, Node 24.21.0.
- Synthetic corpus generated with seed `buyerswitch-v2`: 12,000 visible canonical / 12,840 unique+duplicate occurrences; 8,000 history; uncompressed ~19.4 MiB; gzip of concatenated files ~1.3 MiB.

### Commands actually run

| Command | Result |
|---|---|
| `npx tsx scripts/seed.ts` | 20,000 reviews, 21,400 occurrences; ~19.4 MiB uncompressed; ~1.3 MiB gzip of concatenated files |
| `npm run seed:check` | pass: unique 12000, all 12840, prior 2016-03-02, radar findings 19 |
| `npm test` | 6 Vitest contracts passed |
| `npx eslint .` | pass (0 errors) |
| `npm run typecheck` | pass |
| `npm run build` | Next.js 16.3.5 production build, 28 routes |

### Deployment

Live Vercel production URL not created from this environment. `vercel.json` and Node 24 engines are present; deploy remains unclaimed until a project is linked.

### Limitations

- Seed generator uses bounded authored + biased batches rather than an iterative repair solver; `seed:check` validated required unique/all counts, prior window, hashes, offsets, and Ergonomics TOZO/Apple inequalities on the generated corpus.
- Cold-start performance on a throttled 10 Mbps profile was not measured in this pass.
- PowerPoint uses text slides, not rasterized chart PNGs.
- Marketing pages describe the concept; they do not embed live screenshots of Radar yet.
