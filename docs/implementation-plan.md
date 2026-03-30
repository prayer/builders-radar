# Builders Radar Implementation Plan

Last updated: 2026-03-30

This is the rolling implementation plan for the repository. Update it in place instead of creating dated copies.

## Goal

Maintain and improve a standalone local-first repository that pulls `follow-builders`, snapshots raw data, generates a Chinese daily report with local Codex, renders a static archive site, and can publish that site to GitHub Pages.

## Architecture Summary

The system uses one shared daily pipeline with separate storage for raw snapshots, generated reports, and built site output. That separation keeps prompt iteration and site rebuilds deterministic from saved artifacts whenever possible.

## Completed Baseline

- [x] Create project metadata and npm scripts
- [x] Add local usage and scheduler runbooks
- [x] Implement the `follow-builders` adapter with source fallback
- [x] Persist raw daily snapshots in `data/raw/<YYYY-MM-DD>/follow-builders.json`
- [x] Add versioned prompts for report generation
- [x] Integrate local Codex report generation and save `report.json` plus `report.md`
- [x] Build the archive homepage, daily pages, and site-data JSON
- [x] Wire the shared `scripts/run-daily.js` pipeline entrypoint
- [x] Add local publish support for syncing `site-output/` into a Pages repo checkout
- [x] Add automated tests for adapters, snapshot storage, report generation, site build, publish flow, and the daily pipeline

## Current Work

### Priority 1: Improve report quality and signal density

- [x] Tighten prompt wording for more consistent section quality
- [x] Review which source items should be filtered, merged, or collapsed
- [x] Define clearer expectations for empty sections such as podcasts or blogs
- [x] Keep prompt iteration compatible with the existing saved snapshots and `--rebuild-only` flow

### Priority 2: Improve site presentation and usability

- [x] Compress the detail-page header and improve horizontal layout efficiency
- [ ] Refine the remaining archive page layout and visual hierarchy
- [ ] Decide whether archive pages should expose more metadata on the index
- [ ] Consider lightweight navigation aids such as section anchors or simple search

### Priority 3: Finish operational polish

- [ ] Expand the Windows Task Scheduler runbook into a real operator guide
- [ ] Decide whether routine publish should push automatically or support a safer staged default
- [ ] Add clearer publish status output and better error messages in publish-related scripts
- [ ] Document the expected remote and branch strategy for local publish

## Known Risks And Follow-Ups

- [ ] Investigate the local Node TLS `ECONNRESET` issue against `raw.githubusercontent.com`
- [ ] Decide whether fetch transport fallback should remain as a permanent runtime strategy
- [ ] Review whether publish configuration should support more than one target environment

## Deferred Work

- [ ] Move generation and/or publish automation into GitHub Actions
- [ ] Add more archive metadata or richer browsing patterns
- [ ] Support additional upstream feeds beyond `follow-builders`
- [ ] Explore multi-topic or multi-report output for a single day
- [ ] Consider extending report artifacts with explicit fields such as `sectionStatus`, `collapsedCount`, or `filterNotes` if future site rendering or debugging needs more visibility
