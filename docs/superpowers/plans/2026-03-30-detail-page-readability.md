# Detail Page Readability Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the report detail-page header into a more compact, horizontally efficient layout without changing the report data model.

**Architecture:** Keep the change local to the static site builder and shared stylesheet. The detail page will render a compact header with a full-width title row, then a second row where the summary sits on the left and source stats sit on the right. The header keeps a lightweight section-nav row and removes the desktop-only title truncation behavior.

**Tech Stack:** Node.js 20, built-in `node:test`, static HTML generation, shared CSS template

---

## File Structure

- Modify: `scripts/build-site.js`
- Modify: `site/templates/shared.css`
- Modify: `tests/scripts/build-site.test.js`

## Chunk 1: Test the New Detail Header Structure

### Task 1: Write failing test coverage for the compact detail header

**Files:**
- Modify: `tests/scripts/build-site.test.js`

- [ ] **Step 1: Write the failing test**

Assert that the generated detail page includes:

- a compact detail-header wrapper
- a dedicated source-stats panel in the summary/meta row
- inline section navigation links
- no desktop title truncation class or style hooks
- no legacy chip row inside the detail header

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/scripts/build-site.test.js`
Expected: FAIL because the current detail page still lacks the new summary-plus-stats row and still uses the old title truncation assumptions

## Chunk 2: Implement the New Detail Header

### Task 2: Update detail-page HTML generation

**Files:**
- Modify: `scripts/build-site.js`
- Test: `tests/scripts/build-site.test.js`

- [ ] **Step 1: Implement the minimal HTML change**

Render:

- a full-width title row
- a summary-plus-stats row with four structured stat cells on the right
- a simple section-nav row linking to section anchors
- a smaller back-link row

- [ ] **Step 2: Run the targeted test**

Run: `npm test -- tests/scripts/build-site.test.js`
Expected: PASS

## Chunk 3: Style the Compact Header

### Task 3: Update shared CSS for the detail-page layout

**Files:**
- Modify: `site/templates/shared.css`

- [ ] **Step 1: Add the minimal CSS needed**

Style:

- compact detail header spacing
- smaller title sizing with full rendering instead of ellipsis
- compact summary spacing
- small source-stats panel and stat grid beside the summary
- inline section-nav row
- responsive behavior that collapses the summary/stats row on narrow screens

- [ ] **Step 2: Re-run site-build tests**

Run: `npm test -- tests/scripts/build-site.test.js`
Expected: PASS

## Chunk 4: Verify

### Task 4: Final verification

**Files:**
- Modify: `scripts/build-site.js`
- Modify: `site/templates/shared.css`
- Modify: `tests/scripts/build-site.test.js`

- [ ] **Step 1: Run targeted verification**

Run: `npm test -- tests/scripts/build-site.test.js`
Expected: PASS

- [ ] **Step 2: Run full verification**

Run: `npm test`
Expected: PASS
