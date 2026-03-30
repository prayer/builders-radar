# Detail Page Readability Design

Date: 2026-03-30

## Goal

Improve the readability of the daily report detail page by reducing oversized header height, using horizontal space more effectively, and making the title and source stats feel more compact and structured.

## Scope

This design covers the report detail page only.

- reduce the vertical footprint of the detail-page header
- keep the report title on one line when space allows
- move the header toward a compact horizontal layout
- replace oversized stat chips with a smaller structured stats block
- keep the rest of the report page compatible with the existing report data model

This design does not change the homepage archive layout, site data JSON, report schema, or report generation behavior.

## Problem Summary

The current detail page spends too much of the first viewport on the hero block:

- the title is too large
- the title wraps aggressively and creates a tall visual stack
- the summary occupies too much vertical space before readers reach the first section
- source stats are visually loose and consume horizontal space inefficiently

The user approved a compact "banded header" direction with two constraints:

- the main title should stay on one line when possible
- source stats should be smaller and more regular, closer to a compact grid than large pill chips

## Approved Direction

Use a compact banded header with a two-column arrangement on desktop:

- left column: date, single-line title, compact summary, simple section navigation row
- right column: a small `Source Stats` panel using a tidy two-by-two grid

On smaller screens, the layout should collapse cleanly to one column without creating overflow.

## Layout Rules

### Header

- reduce `h1` size materially from the current hero scale
- prevent title wrapping on wider screens where possible
- keep summary width broad enough for horizontal reading, but cap it to avoid line-length sprawl
- add a light divider before the section-nav row so the header has internal hierarchy without extra height

### Source Stats

- replace large chips with a compact panel
- use small labels with slightly larger numeric values
- keep all four stats aligned in a two-column grid
- maintain visual quietness so stats support the page instead of competing with the title

### Navigation

- include a lightweight inline navigation row for the existing sections
- keep it simple text links, not a heavy sidebar or button set

## Implementation Notes

The change should stay within the static site builder and shared stylesheet:

- `scripts/build-site.js` should render the compact detail-header structure
- `site/templates/shared.css` should add styles specific to the compact detail header, stats panel, and inline section nav

No report data transformation is needed because the page already has the data required for title, summary, section ids, and stats.

## Testing Strategy

Follow TDD:

1. update `build-site` tests to assert the new detail-page structure
2. implement the new HTML structure in `build-site.js`
3. update shared CSS to support the layout
4. run the targeted site-build test
5. run the full test suite

Key assertions:

- detail page includes a dedicated stats panel
- detail page includes section nav links
- detail page HTML no longer relies on the old chip row inside the report hero
- build output remains valid for existing report input
