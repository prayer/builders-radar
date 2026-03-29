# Builders Radar Architecture

Last updated: 2026-03-29

## Purpose

Builders Radar is a local-first AI daily report pipeline. It pulls upstream builder feeds, stores raw snapshots by date, generates a Chinese report with local Codex, and builds a static archive site that can be published to GitHub Pages.

This file is the canonical architecture overview. Update it in place as the system evolves.

## Current Scope

- First upstream source: `follow-builders`
- One report per day
- Chinese summary and translation only
- Static archive homepage and daily detail pages
- Local execution first, optional local publish to GitHub Pages

## System Flow

The pipeline is organized into five layers:

1. Feed adapter
   Fetch upstream feeds and normalize them into one in-memory shape.
2. Snapshot store
   Persist dated raw snapshots under `data/raw/<YYYY-MM-DD>/`.
3. Report generation
   Assemble prompts and call local Codex to produce `report.json` and `report.md`.
4. Site build
   Render archive HTML pages and site-data JSON from saved report artifacts.
5. Publish
   Sync `site-output/` into a local Pages repository checkout and optionally commit or push.

The shared entrypoint is `npm run daily -- --date YYYY-MM-DD`. Manual runs and scheduled runs should go through the same entrypoint.

## Repository Layout

- `AGENTS.md`: agent operating rules and doc navigation
- `README.md`: quick project overview and commands
- `docs/architecture.md`: overall architecture and data flow
- `docs/implementation-plan.md`: rolling plan and remaining work
- `docs/progress.md`: current project status and verified state
- `docs/runbooks/`: operational guides such as local usage and scheduling
- `adapters/`: upstream feed adapters
- `prompts/`: versioned report-generation prompts
- `data/raw/`: stored upstream snapshots
- `data/reports/`: generated report artifacts
- `site/`: site assets and templates
- `scripts/`: pipeline entrypoints and helpers

## Data Model

Three storage layers stay separate:

### Raw Snapshot

Path: `data/raw/<YYYY-MM-DD>/follow-builders.json`

Stores exact upstream payloads plus local fetch metadata.

### Normalized Content

Internal in-memory shape used during report generation:

- `date`
- `sources[]`
- `sections[]`
- normalized items with `id`, `sourceType`, `author`, `title`, `content`, `url`, `publishedAt`, `metrics`, `tags`, `language`

### Report Artifact

Paths:

- `data/reports/<YYYY-MM-DD>/report.json`
- `data/reports/<YYYY-MM-DD>/report.md`

`report.json` is the canonical site input. `report.md` is for readability and debugging.

## Prompt Strategy

Prompt assets live in `prompts/` and are versioned with the repository:

- `prompts/report-system.md`
- `prompts/report-user.md`
- `prompts/summarize-x.md`
- `prompts/summarize-podcast.md`
- `prompts/summarize-blogs.md`
- `prompts/translate-zh.md`

Generation currently runs as one prompt-assembly flow that includes section instructions and final report constraints, with JSON output as the canonical result.

## Site Output

Current output:

- `/index.html`
- `/reports/<YYYY-MM-DD>/index.html`
- `/site-data/reports.json`
- `/site-data/reports/<YYYY-MM-DD>.json`

The homepage lists available reports by date. Each daily page renders the Chinese report and source links from `report.json`.

## Execution Model

Supported `daily` flags:

- `--dry-run`
- `--rebuild-only`
- `--publish`

Pipeline order:

1. Fetch feeds, unless `--rebuild-only` is set
2. Save raw snapshot
3. Generate report artifacts
4. Build site
5. Optionally publish

## Failure Handling

- Feed fetch failure stops the run and preserves existing data
- Rebuild-only mode requires an existing saved snapshot
- Site build failure blocks publish
- Publish failure leaves local artifacts intact for retry

## Deferred Architecture Work

- Search or richer archive navigation
- RSS or other export formats
- Multi-feed federation
- GitHub Actions execution
