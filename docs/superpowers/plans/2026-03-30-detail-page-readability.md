# Detail Page Readability Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the report detail-page header into a more compact, horizontally efficient layout without changing the report data model.

**Architecture:** Keep the change local to the static site builder and shared stylesheet. The detail page will render a compact two-column header on desktop and collapse to one column on narrow screens. Source stats move from loose chips into a compact stats panel, and the header gains a lightweight section-nav row.

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
- a dedicated source-stats panel
- inline section navigation links
- no legacy chip row inside the detail header

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/scripts/build-site.test.js`
Expected: FAIL because the current detail page still uses the old hero layout

## Chunk 2: Implement the New Detail Header

### Task 2: Update detail-page HTML generation

**Files:**
- Modify: `scripts/build-site.js`
- Test: `tests/scripts/build-site.test.js`

- [ ] **Step 1: Implement the minimal HTML change**

Render:

- a compact detail-header grid
- a stats panel with four structured stat cells
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

- compact detail-header grid
- single-line title behavior on wider screens
- compact summary spacing
- small source-stats panel and stat grid
- inline section-nav row
- responsive collapse for narrow screens

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
