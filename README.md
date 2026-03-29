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
- `docs/design/` design documents
- `docs/plans/` implementation plans
- `docs/runbooks/` local usage and scheduler notes
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

Run the current daily entrypoint scaffold:

```bash
npm run daily -- --date 2026-03-29 --dry-run
```

Fetch the upstream `follow-builders` feeds directly:

```bash
node scripts/fetch-feeds.js
```
