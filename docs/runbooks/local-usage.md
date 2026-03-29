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

## Publish site

Copy the generated site into a local GitHub Pages repository directory:

```bash
npm run publish-site -- --repo-path D:\\Development\\path\\to\\pages-repo --no-commit
```

To let the script use a saved default target, copy:

```text
config/publish.config.example.json
```

to:

```text
config/publish.config.json
```

and edit the values for your local setup.

### Recommended local publish flow

1. Keep a local checkout of the Pages repository.
2. Point `targetRepoPath` at that checkout.
3. Start with `--no-commit` to verify file sync.
4. Enable commit and optional push only after the output looks correct.

### Current publish behavior

- syncs the full `site-output/` contents into the target repo root or subdir
- writes `.nojekyll`
- can optionally `git add`, `git commit`, and `git push`
- `run-daily --publish` uses the same publish path

## Current live deployment

- Repository: `https://github.com/prayer/builders-radar`
- Site: `https://prayer.github.io/builders-radar/`

Current preferred real publish command:

```bash
npm run daily -- --date 2026-03-29 --rebuild-only --publish
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
