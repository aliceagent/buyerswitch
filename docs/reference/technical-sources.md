# Runtime decisions and sources

Checked 15 September 2026. Planning check, not a dependency audit or install test.

- Next.js lists 16.x as Active LTS and 15.x as Maintenance LTS. For this new build use Next 16, resolve its supported stable patch during scaffold and record it exactly. [Official Next.js support policy](https://nextjs.org/support-policy).
- Node.js lists 24 as LTS and 20 as end of life. Use Node 24 LTS locally, in CI and Vercel; record the resolved patch. [Official Node.js releases](https://nodejs.org/en/about/previous-releases).

Keep exact resolved package versions and package-lock.json. Use npm ci after setup. Recheck advisories at build time; this package does not certify a future dependency graph. Do not apply blanket fs/http/https browser fallbacks to hide an incompatible export dependency. Use its documented browser entry and verify an actual export.
