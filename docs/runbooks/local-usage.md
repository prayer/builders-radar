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

## Generate report only

Run local Codex against an existing snapshot:

```bash
npm run generate-report -- 2026-03-29 data/raw/2026-03-29/follow-builders.json
```

## Build site only

Rebuild the static archive from saved reports:

```bash
npm run build-site
```

## Feed transport note

Some local environments may fail to reach `raw.githubusercontent.com` from Node.js with a TLS reset such as `ECONNRESET` during the HTTPS handshake.

Current project behavior:

- Try GitHub Raw first
- Fall back to jsDelivr mirror automatically

Current mirror:

```text
https://cdn.jsdelivr.net/gh/zarazhangrui/follow-builders@main
```

This is recorded as an environment issue to investigate later. The fallback is a runtime mitigation, not the final root-cause fix.
