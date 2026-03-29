# builders-radar

Local-first AI daily report generator and static site.

## Current scope

- Pull the central `follow-builders` feeds
- Snapshot raw daily data locally
- Use local Codex to generate a Chinese daily report
- Build a static archive site for GitHub Pages
- Support both manual and scheduled local runs

## Current repository layout

- `adapters/` upstream feed adapters
- `prompts/` report generation and translation prompts
- `data/raw/` saved raw daily snapshots
- `data/reports/` generated report artifacts
- `docs/architecture.md` overall architecture and data flow
- `docs/implementation-plan.md` rolling implementation plan
- `docs/progress.md` current status and next steps
- `docs/runbooks/` operational runbooks
- `scripts/` pipeline entrypoints

## Commands

Install once:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run the daily entrypoint:

```bash
npm run daily -- --date 2026-03-29 --dry-run
```

Rebuild from an existing saved snapshot without refetching:

```bash
npm run daily -- --date 2026-03-29 --rebuild-only
```

Fetch the upstream `follow-builders` feeds directly:

```bash
node scripts/fetch-feeds.js
```

Generate a report from an existing snapshot:

```bash
npm run generate-report -- 2026-03-29 data/raw/2026-03-29/follow-builders.json
```

Build the static archive site from saved reports:

```bash
npm run build-site
```

Publish the built site into a local GitHub Pages repo directory:

```bash
npm run publish-site -- --repo-path D:\\Development\\path\\to\\pages-repo --no-commit
```
