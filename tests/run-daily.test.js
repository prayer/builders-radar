import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('parseRunOptions reads date and mode flags from CLI args', async () => {
  let mod;

  try {
    mod = await import('../scripts/run-daily.js');
  } catch (error) {
    assert.fail(`run-daily module is missing: ${error.message}`);
  }

  assert.equal(typeof mod.parseRunOptions, 'function');

  const options = mod.parseRunOptions([
    '--date',
    '2026-03-29',
    '--dry-run',
    '--publish'
  ]);

  assert.deepEqual(options, {
    date: '2026-03-29',
    dryRun: true,
    rebuildOnly: false,
    publish: true
  });
});

test('resolveEntrypointUrl normalizes a relative script path for direct-run detection', async () => {
  const mod = await import('../scripts/run-daily.js');
  const resolved = mod.resolveEntrypointUrl('scripts/run-daily.js');

  assert.match(resolved, /^file:\/\/\/[A-Za-z]:\/.*scripts\/run-daily\.js$/);
});

test('runDaily fetches upstream data and saves a dated raw snapshot', async () => {
  const mod = await import('../scripts/run-daily.js');
  const outputRoot = await mkdtemp(join(tmpdir(), 'builders-radar-run-'));

  const result = await mod.runDaily({
    argv: ['--date', '2026-03-29', '--dry-run'],
    outputRoot,
    fetchSnapshot: async () => ({
      source: 'follow-builders',
      fetchedAt: '2026-03-29T09:00:00.000Z',
      feedGeneratedAt: '2026-03-29T06:00:00.000Z',
      feeds: {
        x: { generatedAt: '2026-03-29T06:00:00.000Z', x: [] },
        podcasts: { generatedAt: '2026-03-29T06:00:00.000Z', podcasts: [] },
        blogs: { generatedAt: '2026-03-29T06:00:00.000Z', blogs: [] }
      },
      stats: {
        builders: 0,
        tweets: 0,
        podcasts: 0,
        blogs: 0
      }
    })
  });

  assert.equal(result.status, 'snapshot_saved');
  assert.equal(result.snapshotPath, join(outputRoot, '2026-03-29', 'follow-builders.json'));

  const saved = JSON.parse(await readFile(result.snapshotPath, 'utf8'));
  assert.equal(saved.source, 'follow-builders');
  assert.equal(saved.fetchedAt, '2026-03-29T09:00:00.000Z');
});
