# builders-radar Design

## Goal

Build a local-first AI daily report site that consumes upstream feeds, stores raw daily snapshots, uses local Codex to generate Chinese reports, and publishes static pages suitable for GitHub Pages.

## Scope

- New standalone repository under `D:\Development\codex-projects\builders-radar`
- First upstream source: `follow-builders`
- One Chinese report per day with sectioned content
- Manual and scheduled local execution through one main command
- GitHub Pages publish path from local output

## Architecture

The system is split into five layers:

1. Feed adapters
   - Fetch upstream feeds and map them to a unified internal format
2. Snapshot store
   - Persist raw daily upstream responses by date
3. Report generator
   - Use local Codex and project prompts to generate Chinese report artifacts
4. Site builder
   - Render a static index and daily report pages
5. Scheduler and publisher
   - Run locally on demand or by Windows Task Scheduler and publish to GitHub

## Repository Structure

- `AGENTS.md`
- `README.md`
- `docs/design/`
- `docs/plans/`
- `docs/runbooks/`
- `adapters/`
- `prompts/`
- `data/raw/`
- `data/reports/`
- `site/`
- `scripts/`

## Data Model

Three storage layers stay separate:

### Raw snapshot

Path: `data/raw/<YYYY-MM-DD>/follow-builders.json`

Stores the exact upstream payloads plus local fetch metadata.

### Normalized content

Internal in-memory shape used by report generation:

- `date`
- `sources[]`
- `sections[]`
- normalized items with `id`, `sourceType`, `author`, `title`, `content`, `url`, `publishedAt`, `metrics`, `tags`, `language`

### Report artifact

Path:

- `data/reports/<YYYY-MM-DD>/report.json`
- `data/reports/<YYYY-MM-DD>/report.md`

`report.json` is the canonical site input. `report.md` is for readability and debugging.

## Prompt Strategy

Prompts will reuse ideas from `follow-builders/prompts` but will be rewritten for a report pipeline:

- `prompts/report-system.md`
- `prompts/report-user.md`
- `prompts/summarize-x.md`
- `prompts/summarize-podcast.md`
- `prompts/summarize-blogs.md`
- `prompts/translate-zh.md`

Generation runs in two stages:

1. Section generation for X, podcasts, and blogs
2. Final daily report assembly

## Site Output

Phase 1 output:

- `/index.html`
- `/reports/<YYYY-MM-DD>/index.html`
- `/site-data/reports.json`
- `/site-data/reports/<YYYY-MM-DD>.json`

The homepage lists reports by date. Each daily page shows the full Chinese report and original links.

## Execution Model

One main entrypoint drives both manual and scheduled runs:

- `npm run daily -- --date YYYY-MM-DD`

Supported flags:

- `--dry-run`
- `--rebuild-only`
- `--publish`

Pipeline:

1. Fetch feeds
2. Save raw snapshot
3. Generate report artifacts
4. Build site
5. Optionally publish

## Failure Handling

- Feed fetch failure stops the run and preserves existing data
- Section generation failure records warnings without discarding successful sections
- Site build failure blocks publish
- Publish failure leaves local artifacts intact for retry

## Deferred Work

- Search
- RSS
- Multi-topic pages per day
- Multi-feed federation
- GitHub Actions execution
