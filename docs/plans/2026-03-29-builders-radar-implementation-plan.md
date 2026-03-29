# builders-radar Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone local-first repository that pulls `follow-builders` feeds, snapshots the raw data, generates a Chinese daily report with local Codex, and renders a static archive site.

**Architecture:** A small pipeline with one upstream adapter, one normalized report path, one static site builder, and one shared entrypoint for both manual and scheduled local execution. Raw snapshots and generated reports are stored separately so prompts and reports can be rebuilt later without re-fetching history.

**Tech Stack:** Node.js, TypeScript or modern ESM JavaScript, static HTML generation, local Codex CLI integration, Windows Task Scheduler for automation

---

## Chunk 1: Repository scaffold and shared conventions

### Task 1: Create project metadata and npm skeleton

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `scripts/`

- [ ] **Step 1: Write the package manifest with the core scripts**
- [ ] **Step 2: Add a `.gitignore` for generated assets, dependencies, and environment files**
- [ ] **Step 3: Add a placeholder main entrypoint script for daily runs**
- [ ] **Step 4: Run `npm install` to create the lockfile**
- [ ] **Step 5: Run the main script once to verify argument parsing works**

### Task 2: Add project documentation and runbooks

**Files:**
- Create: `docs/runbooks/local-usage.md`
- Create: `docs/runbooks/windows-task-scheduler.md`
- Modify: `README.md`

- [ ] **Step 1: Document the manual run flow**
- [ ] **Step 2: Document the scheduled local run flow**
- [ ] **Step 3: Add setup notes to the root README**
- [ ] **Step 4: Verify the commands in the docs match the package scripts**

## Chunk 2: Upstream fetch and snapshot storage

### Task 3: Implement the `follow-builders` adapter

**Files:**
- Create: `adapters/follow-builders.js`
- Create: `scripts/fetch-feeds.js`
- Test: `tests/adapters/follow-builders.test.js`

- [ ] **Step 1: Write adapter tests for feed download and normalization boundaries**
- [ ] **Step 2: Implement upstream fetch for `feed-x.json`, `feed-podcasts.json`, and `feed-blogs.json`**
- [ ] **Step 3: Map the feeds to one normalized in-memory shape**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

### Task 4: Persist raw daily snapshots

**Files:**
- Create: `scripts/save-snapshot.js`
- Test: `tests/scripts/save-snapshot.test.js`

- [ ] **Step 1: Write tests for date-based snapshot paths and overwrite protection**
- [ ] **Step 2: Implement snapshot writing for `data/raw/<YYYY-MM-DD>/follow-builders.json`**
- [ ] **Step 3: Verify snapshot metadata includes fetch timestamps and feed timestamps**
- [ ] **Step 4: Run tests**
- [ ] **Step 5: Commit**

## Chunk 3: Prompt loading and local Codex report generation

### Task 5: Add project prompts

**Files:**
- Create: `prompts/report-system.md`
- Create: `prompts/report-user.md`
- Create: `prompts/summarize-x.md`
- Create: `prompts/summarize-podcast.md`
- Create: `prompts/summarize-blogs.md`
- Create: `prompts/translate-zh.md`

- [ ] **Step 1: Draft the report prompts based on `follow-builders` prompt intent**
- [ ] **Step 2: Align the prompts to structured JSON-first output**
- [ ] **Step 3: Review prompt wording to avoid chat-style filler**
- [ ] **Step 4: Commit**

### Task 6: Integrate local Codex for section and final report generation

**Files:**
- Create: `scripts/generate-report.js`
- Create: `scripts/lib/codex.js`
- Test: `tests/scripts/generate-report.test.js`

- [ ] **Step 1: Write tests for prompt assembly and report artifact parsing**
- [ ] **Step 2: Implement local Codex CLI invocation**
- [ ] **Step 3: Generate section summaries and final report assembly**
- [ ] **Step 4: Save `report.json` and `report.md` to `data/reports/<YYYY-MM-DD>/`**
- [ ] **Step 5: Run tests and one manual sample generation**
- [ ] **Step 6: Commit**

## Chunk 4: Static site generation

### Task 7: Build the archive homepage and daily report pages

**Files:**
- Create: `site/templates/index.html`
- Create: `site/templates/report.html`
- Create: `scripts/build-site.js`
- Test: `tests/scripts/build-site.test.js`

- [ ] **Step 1: Write build tests for report indexing and output paths**
- [ ] **Step 2: Implement homepage generation from report metadata**
- [ ] **Step 3: Implement daily detail page generation from `report.json`**
- [ ] **Step 4: Emit `site-data` JSON alongside the HTML**
- [ ] **Step 5: Run build tests**
- [ ] **Step 6: Commit**

## Chunk 5: Unified execution flow and publish path

### Task 8: Wire the shared daily pipeline entrypoint

**Files:**
- Create: `scripts/run-daily.js`
- Modify: `package.json`
- Test: `tests/scripts/run-daily.test.js`

- [ ] **Step 1: Write tests for `--date`, `--dry-run`, and `--rebuild-only` behavior**
- [ ] **Step 2: Compose fetch, snapshot, report generation, and site build steps into one pipeline**
- [ ] **Step 3: Ensure rebuild-only mode skips network fetch and reads the saved snapshot**
- [ ] **Step 4: Run pipeline tests**
- [ ] **Step 5: Commit**

### Task 9: Add local publish support and operational docs

**Files:**
- Create: `scripts/publish-site.js`
- Modify: `docs/runbooks/local-usage.md`
- Modify: `docs/runbooks/windows-task-scheduler.md`

- [ ] **Step 1: Define the local publish command flow for GitHub Pages**
- [ ] **Step 2: Document the expected git remote and branch strategy**
- [ ] **Step 3: Document how Task Scheduler should call the daily command**
- [ ] **Step 4: Manually verify one full dry-run and one publish-ready run**
- [ ] **Step 5: Commit**
