# Builders Radar Progress

Last updated: 2026-03-30

This file is the rolling project status summary. Update it in place instead of creating dated snapshots.

## Current Status

The local-first pipeline is working end to end for the first source, `follow-builders`. The repository can fetch feeds, save dated raw snapshots, generate Chinese report artifacts with local Codex, build the static archive site, and publish the site into a GitHub Pages repository checkout. Report generation now also applies conservative input preprocessing before prompt assembly so obviously low-signal X posts are removed, quote tweets are preserved by default, and empty podcast/blog sections are represented explicitly.

## Implemented

- `follow-builders` feed adapter with source fallback
- raw snapshot storage in `data/raw/<date>/follow-builders.json`
- local Codex report generation to:
  - `data/reports/<date>/report.json`
  - `data/reports/<date>/report.md`
- conservative report-input preprocessing for prompt assembly:
  - filters only obviously low-signal short X posts
  - preserves quote tweets by default
  - marks empty podcast and blog sections explicitly
- tightened report prompts for stronger signal selection and clearer empty-section handling
- static archive site generation to:
  - `site-output/index.html`
  - `site-output/reports/<date>/index.html`
  - `site-output/site-data/reports.json`
  - `site-output/site-data/reports/<date>.json`
- compact detail-page header layout:
  - smaller single-line title on wider screens
  - structured `Source Stats` panel instead of large stat chips
  - inline section navigation for faster movement into the report body
- local publish workflow to sync `site-output/` into a separate GitHub Pages repo checkout
- unified pipeline in `scripts/run-daily.js`
- `--rebuild-only` support to reuse an existing raw snapshot
- `--publish` support to publish after site build

## Verified State

Verified on 2026-03-30:

- `npm test -- tests/scripts/report-input.test.js`
- `npm test -- tests/scripts/generate-report.test.js`
- `npm test -- tests/run-daily.test.js`
- `npm test`

## Deployment State

- GitHub repository: `https://github.com/prayer/builders-radar`
- GitHub Pages URL: `https://prayer.github.io/builders-radar/`
- Main branch is pushed and current
- `gh-pages` branch exists remotely and is already serving the static output
- Local publish target can be configured through `config/publish.config.json`

## Known Issues

Requests to `raw.githubusercontent.com` may fail locally with Node TLS `ECONNRESET` during the HTTPS handshake.

Current mitigation:

- try GitHub Raw first
- fall back to jsDelivr mirror

This is a workaround, not a root-cause fix. The runtime note is also documented in `docs/runbooks/local-usage.md`.

## Current Focus

- review the 2026-03-29 sample output and iterate on prompt quality using `--rebuild-only`
- refine the archive index information density and visual hierarchy
- decide whether the archive index should expose more report metadata
- consider whether the detail page needs additional lightweight navigation beyond the new inline section links
- expand the Windows Task Scheduler runbook
- make publish behavior and status output clearer

## Notes

- The generated report for `2026-03-29` is the current seed sample for prompt iteration
- Keep `report.json` as the canonical site input
- Avoid refetching when prompt tuning; prefer `--rebuild-only`
- Conservative preprocessing intentionally does not drop quote tweets just because they are quotes
- `config/publish.config.json` is intentionally local-only and ignored by git
