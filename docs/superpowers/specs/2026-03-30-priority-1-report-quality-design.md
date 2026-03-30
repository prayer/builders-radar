# Priority 1 Report Quality Design

Date: 2026-03-30

## Goal

Improve report quality and signal density for the existing local-first daily pipeline without changing the published report schema or the site rendering flow.

## Scope

This design covers the Priority 1 work from the rolling implementation plan:

- tighten report-generation prompts for more consistent section quality
- review which source items should be filtered, merged, or collapsed
- define clearer expectations for empty sections such as podcasts or blogs
- preserve the existing `--rebuild-only` workflow for prompt iteration

This design does not change feed fetching, site presentation, publish behavior, or the shape of `report.json`.

## Constraints

- Keep the current `report.json` schema stable
- Keep quote tweets by default because builder-selected quoted content is often high signal
- Use conservative filtering only; remove only items that are obviously low signal
- Prefer deterministic preprocessing over model-only heuristics when a simple rule is enough
- Preserve the current daily pipeline entrypoint and tests

## Recommended Approach

Use a thin preprocessing layer before prompt assembly, plus tighter prompt instructions.

The preprocessing layer converts the raw snapshot into a smaller, report-oriented prompt input. It removes only clearly low-signal X posts, keeps quote tweets unless they are genuinely content-free, and marks empty or thin sections so the model can handle them consistently. The model still writes the report; preprocessing only improves the quality of what reaches it.

This approach was chosen over prompt-only changes because Priority 1 needs more stable behavior than prompt wording alone can guarantee. It was chosen over schema expansion because expanding the report output would enlarge the change surface into the site builder and published data shape.

## Input Handling Rules

### X / Twitter

Use conservative, explainable rules:

- keep quote tweets by default
- keep original posts that contain substantive text
- drop only obviously low-signal posts such as very short exclamations, empty hype, or context-free filler
- do not filter by engagement metrics
- do not build a complex scoring system

If one builder has multiple very short posts that are clearly fragmentary and repetitive, allow them to be collapsed into a smaller prompt representation. This should be rare and only used when it reduces noise without losing meaning.

### Podcasts and Blogs

- if a section has zero items, pass that fact explicitly in the prompt input
- if an item exists but source content is thin, preserve it and instruct the model to summarize briefly or state the limitation plainly

The goal is to stabilize empty-section handling without hiding data.

## Prompt Changes

Prompt wording should be tightened to emphasize:

- signal over completeness
- omission of trivial items
- concise handling of empty sections
- merging repeated themes into one conclusion when appropriate
- a calm, analytical tone without filler

The existing prompt set remains versioned project assets in `prompts/`.

## Testing Strategy

Follow TDD:

1. Add unit tests for the new preprocessing behavior
2. Add or update `generate-report` tests to verify the prompt uses preprocessed input
3. Run targeted regression tests for `run-daily`

Key cases:

- obvious low-signal short post is removed
- quote tweet remains in the prompt input
- substantive original post remains in the prompt input
- empty podcasts/blogs are represented explicitly
- existing report artifact writing behavior remains unchanged

## Deferred Follow-Up

The following idea is intentionally deferred and not part of this implementation:

- extend the report schema with explicit fields such as `sectionStatus`, `collapsedCount`, or `filterNotes`

That follow-up may become worthwhile after this conservative pass if better observability or richer rendering becomes necessary.
