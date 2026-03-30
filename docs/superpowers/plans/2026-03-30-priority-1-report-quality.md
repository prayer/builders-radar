# Priority 1 Report Quality Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conservative preprocessing and tighter prompts so report generation produces higher-signal, more consistent output without changing the report artifact schema.

**Architecture:** Insert a small report-input preparation module between snapshot loading and prompt assembly. The module produces a report-oriented input object with conservative filtering rules, while prompt files provide stricter instructions for section quality and empty-section handling. The generated `report.json` shape stays unchanged.

**Tech Stack:** Node.js 20, built-in `node:test`, ESM modules, markdown prompt assets

---

## File Structure

- Create: `scripts/lib/report-input.js`
- Modify: `scripts/generate-report.js`
- Modify: `prompts/report-system.md`
- Modify: `prompts/report-user.md`
- Modify: `prompts/summarize-x.md`
- Modify: `prompts/summarize-podcast.md`
- Modify: `prompts/summarize-blogs.md`
- Create: `tests/scripts/report-input.test.js`
- Modify: `tests/scripts/generate-report.test.js`
- Modify: `tests/run-daily.test.js`
- Modify: `docs/implementation-plan.md`
- Modify: `docs/progress.md`

## Chunk 1: Preprocessing Module

### Task 1: Add failing tests for conservative filtering

**Files:**
- Create: `tests/scripts/report-input.test.js`

- [ ] **Step 1: Write the failing tests**

Add tests for:

- obvious low-signal short X post is removed
- quote tweet is preserved
- substantive original X post is preserved
- empty podcast and blog sections are represented explicitly

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/scripts/report-input.test.js`
Expected: FAIL because `scripts/lib/report-input.js` does not exist yet

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib/report-input.js` with focused helpers to:

- identify clearly low-signal short text
- normalize X builders and tweets for prompt input
- preserve quote tweets by default
- return explicit empty-section metadata for podcasts/blogs

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/scripts/report-input.test.js`
Expected: PASS

### Task 2: Keep the module narrow and deterministic

**Files:**
- Modify: `scripts/lib/report-input.js`
- Test: `tests/scripts/report-input.test.js`

- [ ] **Step 1: Refactor only after green**

Keep helpers small and deterministic. Avoid score systems or schema changes.

- [ ] **Step 2: Re-run module tests**

Run: `npm test -- tests/scripts/report-input.test.js`
Expected: PASS

## Chunk 2: Report Generation Integration

### Task 3: Make `generate-report` use preprocessed input

**Files:**
- Modify: `scripts/generate-report.js`
- Modify: `tests/scripts/generate-report.test.js`

- [ ] **Step 1: Write the failing integration expectation**

Update the test to assert the Codex prompt contains:

- the retained high-signal builder content
- the retained quote tweet content
- explicit empty-section markers
- absence of filtered low-signal filler

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/scripts/generate-report.test.js`
Expected: FAIL because prompt assembly still uses raw snapshot JSON

- [ ] **Step 3: Implement the minimal integration**

Import the new report-input module in `scripts/generate-report.js`, prepare the prompt input, and serialize that object in the prompt instead of the raw snapshot.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/scripts/generate-report.test.js`
Expected: PASS

### Task 4: Verify pipeline compatibility

**Files:**
- Modify: `tests/run-daily.test.js`

- [ ] **Step 1: Add or update a focused regression test if needed**

Keep the pipeline contract stable while allowing the report generator internals to change.

- [ ] **Step 2: Run the targeted daily pipeline tests**

Run: `npm test -- tests/run-daily.test.js`
Expected: PASS

## Chunk 3: Prompt Tightening

### Task 5: Tighten report prompts

**Files:**
- Modify: `prompts/report-system.md`
- Modify: `prompts/report-user.md`
- Modify: `prompts/summarize-x.md`
- Modify: `prompts/summarize-podcast.md`
- Modify: `prompts/summarize-blogs.md`

- [ ] **Step 1: Update prompt wording**

Add stricter guidance for:

- signal over completeness
- skipping trivial items
- preserving quote-tweet context when useful
- brief handling for empty or thin sections
- merging repeated themes into concise conclusions

- [ ] **Step 2: Re-run prompt-sensitive tests**

Run: `npm test -- tests/scripts/generate-report.test.js`
Expected: PASS

## Chunk 4: Documentation and Verification

### Task 6: Record the completed work and deferred schema idea

**Files:**
- Modify: `docs/progress.md`
- Modify: `docs/implementation-plan.md`

- [ ] **Step 1: Update rolling docs**

Record the new preprocessing behavior and tighter prompts in `docs/progress.md`. Mark relevant Priority 1 items complete or partially complete in `docs/implementation-plan.md`, and record schema expansion as deferred follow-up.

- [ ] **Step 2: Run final targeted verification**

Run:

- `npm test -- tests/scripts/report-input.test.js`
- `npm test -- tests/scripts/generate-report.test.js`
- `npm test -- tests/run-daily.test.js`

Expected: all PASS

- [ ] **Step 3: Run broader verification**

Run: `npm test`
Expected: PASS
