# Detail Page Readability Design

Date: 2026-03-30

## Goal

Improve the readability of the daily report detail page by reducing the oversized header title, letting the title use the full top row width, and moving source stats into a compact secondary block beside the summary instead of competing with the title.

## Scope

This design covers the report detail page only.

- reduce the perceived weight of the detail-page header
- let the report title display fully instead of truncating with ellipsis
- use the title row width for content instead of reserving a permanent right column
- place source stats beside the summary as a smaller structured stats block on desktop
- keep the rest of the report page compatible with the existing report data model

This design does not change the homepage archive layout, site data JSON, report schema, or report generation behavior.

## Problem Summary

The current detail page spends too much of the first viewport on the hero block:

- the title is too large
- the title is currently truncated with ellipsis on desktop instead of being shown in full
- the summary and title are artificially width-constrained by a fixed right-side stats column
- source stats compete too early for horizontal space even though they are secondary information

The approved revision changes the earlier compact two-column direction:

- the title should no longer be cut off with ellipsis
- source stats may move below the title, while still remaining beside the summary on desktop
- the title font should shrink by roughly one to two steps from the current scale

## Approved Direction

Use a compact stacked header with one full-width title row and one split metadata row:

- top flow: date, full title
- middle row: summary on the left and a compact `Source Stats` panel on the right
- bottom row: simple section navigation links and the existing back link

This keeps the first viewport structured, gives the title the full available width before wrapping, and keeps `Source Stats` visually tied to the summary instead of the title line.

## Layout Rules

### Header

- reduce `h1` size materially from the current hero scale by about one to two visual steps
- remove desktop ellipsis behavior so long titles render fully
- allow normal wrapping where needed instead of truncation
- keep summary width broad enough for horizontal reading, but cap it to avoid line-length sprawl
- put stats on the same desktop row as the summary so the block reads as context, not as part of the headline
- preserve internal hierarchy with spacing or a light divider before the lower metadata/navigation area

### Source Stats

- keep source stats as a compact secondary panel beside the summary on desktop
- use small labels with slightly larger numeric values
- keep all four stats aligned in a two-column grid
- maintain visual quietness so stats support the page instead of competing with the title
- avoid reserving a permanent right-side column for stats at the title level

### Navigation

- include a lightweight inline navigation row for the existing sections
- keep it simple text links, not a heavy sidebar or button set
- place navigation after the summary-plus-stats row so the document hierarchy reads as content first, controls second

## Implementation Notes

The change should stay within the static site builder and shared stylesheet:

- `scripts/build-site.js` should render the compact detail-header structure with a full-width title row and a separate summary/stats row
- `site/templates/shared.css` should remove the forced desktop title truncation and style the reordered stats panel plus inline section nav

No report data transformation is needed because the page already has the data required for title, summary, section ids, and stats.

## Testing Strategy

Follow TDD:

1. update `build-site` tests to assert the new detail-page structure
2. implement the new HTML structure in `build-site.js`
3. update shared CSS to support the layout
4. run the targeted site-build test
5. run the full test suite

Key assertions:

- detail page includes a dedicated stats panel beside the summary row
- detail page includes section nav links
- detail page HTML no longer forces the title into a desktop single-line ellipsis layout
- detail page HTML no longer relies on the old chip row inside the report hero
- build output remains valid for existing report input
