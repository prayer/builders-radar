import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('saveSnapshot stores a dated raw snapshot with source metadata', async () => {
  let mod;

  try {
    mod = await import('../../scripts/save-snapshot.js');
  } catch (error) {
    assert.fail(`save-snapshot module is missing: ${error.message}`);
  }

  const outputRoot = await mkdtemp(join(tmpdir(), 'builders-radar-'));
  const snapshot = {
    source: 'follow-builders',
    fetchedAt: '2026-03-29T08:00:00.000Z',
    feedGeneratedAt: '2026-03-29T06:00:00.000Z',
    feeds: {
      x: { generatedAt: '2026-03-29T06:00:00.000Z', x: [] },
      podcasts: { generatedAt: '2026-03-29T06:00:00.000Z', podcasts: [] },
      blogs: { generatedAt: '2026-03-29T06:00:00.000Z', blogs: [] }
    }
  };

  const savedPath = await mod.saveSnapshot({
    outputRoot,
    date: '2026-03-29',
    snapshot
  });

  assert.equal(savedPath, join(outputRoot, '2026-03-29', 'follow-builders.json'));

  const saved = JSON.parse(await readFile(savedPath, 'utf8'));

  assert.equal(saved.source, 'follow-builders');
  assert.equal(saved.fetchedAt, '2026-03-29T08:00:00.000Z');
  assert.equal(saved.feedGeneratedAt, '2026-03-29T06:00:00.000Z');
});
