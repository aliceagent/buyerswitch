# Sprint 22b — PowerPoint and chart images

**Prerequisites:** 22a. README defines execution order; IDs preserve the original package.
**Read first:** docs/00-overview.md, metrics-and-evidence.md, data-model.md and relevant seed/copy/design references.

## Build

Dynamic documented browser PptxGenJS. Frozen registry snapshot. Title workspace/filter/date; readable slide per widget, split long tables; methodology/evidence close. 2× chart images with tables in appendix or companion workbook, not large notes-only tables.

SVG literal colors/local assets, await fonts. Standalone PNG includes title/filter/synthetic. No tainted remote canvas or blanket Node-core fallbacks. Progress yields between slides; retry same snapshot; revoke URLs. Image-based chart deck not described as editable native charts.

## Acceptance

PPTX opens; long content split; one snapshot; fonts/colors/images legible; recoverable errors.

Run build/lint/typecheck; seed:check from 03 onward. Numerical changes run contract tests; interaction changes run relevant browser smoke. Record results/deviations in docs/BUILD-LOG.md. Never mark an unrun check passed.

Frontend demo only. Implement assigned sprint, preserve earlier behavior, do not start next sprint automatically.

**Suggested commit:** sprint-22b: powerpoint and chart images
