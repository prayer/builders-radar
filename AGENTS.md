# builders-radar Agent Guide

## Purpose

This repository builds a local-first AI daily report site from upstream feeds.
The first upstream source is `follow-builders`.

## Working Rules

- Keep raw upstream snapshots in `data/raw/<YYYY-MM-DD>/`.
- Keep generated report artifacts in `data/reports/<YYYY-MM-DD>/`.
- Treat prompts as versioned project assets in `prompts/`.
- Keep the site output deterministic from stored report artifacts when possible.
- Preserve both manual and scheduled execution paths through the same main entrypoint.

## Execution Entry Points

- Manual run: `npm run daily -- --date YYYY-MM-DD`
- Rebuild only: `npm run daily -- --date YYYY-MM-DD --rebuild-only`
- Dry run: `npm run daily -- --date YYYY-MM-DD --dry-run`

## Initial Scope

- One upstream adapter: `follow-builders`
- One report per day
- Chinese summary and translation only
- Static archive homepage and daily detail pages
- Local execution first, GitHub Actions later

## Documentation

- Start with `docs/architecture.md` for the overall system architecture and data flow.
- Check `docs/progress.md` for current project status, verified state, and immediate focus.
- Check `docs/implementation-plan.md` for the rolling plan, open work, and deferred items.
- Use `docs/runbooks/` only for operational guides such as local usage and scheduling.
- Do not create dated copies of architecture, plan, or progress docs. Update those files in place.
