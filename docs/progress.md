# Builders Radar Progress

Last updated: 2026-03-29

This file is the rolling project status summary. Update it in place instead of creating dated snapshots.

## Current Status

The local-first pipeline is working end to end for the first source, `follow-builders`. The repository can fetch feeds, save dated raw snapshots, generate Chinese report artifacts with local Codex, build the static archive site, and publish the site into a GitHub Pages repository checkout.

## Implemented

- `follow-builders` feed adapter with source fallback
- raw snapshot storage in `data/raw/<date>/follow-builders.json`
- local Codex report generation to:
  - `data/reports/<date>/report.json`
  - `data/reports/<date>/report.md`
- static archive site generation to:
  - `site-output/index.html`
  - `site-output/reports/<date>/index.html`
  - `site-output/site-data/reports.json`
  - `site-output/site-data/reports/<date>.json`
- local publish workflow to sync `site-output/` into a separate GitHub Pages repo checkout
- unified pipeline in `scripts/run-daily.js`
- `--rebuild-only` support to reuse an existing raw snapshot
- `--publish` support to publish after site build

## Verified State

Verified on 2026-03-29:

- `npm test`
- `npm run daily -- --date 2026-03-29 --dry-run`
- `npm run daily -- --date 2026-03-29 --rebuild-only --dry-run`
- `npm run daily -- --date 2026-03-29 --rebuild-only --publish`
- `npm run generate-report -- 2026-03-29 data/raw/2026-03-29/follow-builders.json`
- `npm run build-site`
- `npm run publish-site -- --repo-path <local-pages-repo> --no-commit`

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

- improve report prompt quality and consistency
- refine the generated page layout and visual hierarchy
- review which source items should be filtered or collapsed to reduce noise
- expand the Windows Task Scheduler runbook
- make publish behavior and status output clearer

## Notes

- The generated report for `2026-03-29` is the current seed sample for prompt iteration
- Keep `report.json` as the canonical site input
- Avoid refetching when prompt tuning; prefer `--rebuild-only`
- `config/publish.config.json` is intentionally local-only and ignored by git
