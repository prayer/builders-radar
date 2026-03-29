# Local Usage

## Manual run

Run a dated local pipeline execution:

```bash
npm run daily -- --date 2026-03-29
```

## Dry run

Generate artifacts without publishing:

```bash
npm run daily -- --date 2026-03-29 --dry-run
```

## Rebuild from a saved snapshot

Rebuild site and reports without fetching new upstream data:

```bash
npm run daily -- --date 2026-03-29 --rebuild-only
```
