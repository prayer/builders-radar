import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
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

test('runDaily saves a dated raw snapshot before calling report generation', async () => {
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
    }),
    reportGenerator: async ({ snapshotPath }) => ({
      report: {
        date: '2026-03-29',
        title: 'AI Builders 中文日报 2026-03-29',
        summary: 'summary',
        sections: [],
        sourceStats: {
          builders: 0,
          tweets: 0,
          podcasts: 0,
          blogs: 0
        }
      },
      reportPath: join(outputRoot, '2026-03-29', 'report.json'),
      markdownPath: join(outputRoot, '2026-03-29', 'report.md'),
      snapshotPath
    }),
    siteBuilder: async () => ({
      indexPath: join(outputRoot, 'index.html'),
      reportPages: [join(outputRoot, 'reports', '2026-03-29', 'index.html')]
    })
  });

  assert.equal(result.status, 'site_built');
  assert.equal(result.snapshotPath, join(outputRoot, '2026-03-29', 'follow-builders.json'));

  const saved = JSON.parse(await readFile(result.snapshotPath, 'utf8'));
  assert.equal(saved.source, 'follow-builders');
  assert.equal(saved.fetchedAt, '2026-03-29T09:00:00.000Z');
});

test('runDaily generates report artifacts after saving the snapshot', async () => {
  const mod = await import('../scripts/run-daily.js');
  const outputRoot = await mkdtemp(join(tmpdir(), 'builders-radar-run-'));
  const reportsRoot = await mkdtemp(join(tmpdir(), 'builders-radar-reports-'));

  const result = await mod.runDaily({
    argv: ['--date', '2026-03-29', '--dry-run'],
    outputRoot,
    reportsRoot,
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
    }),
    reportGenerator: async ({ date, snapshotPath }) => ({
      report: {
        date,
        title: 'AI Builders 中文日报 2026-03-29',
        summary: 'summary',
        sections: [],
        sourceStats: {
          builders: 0,
          tweets: 0,
          podcasts: 0,
          blogs: 0
        }
      },
      reportPath: join(reportsRoot, date, 'report.json'),
      markdownPath: join(reportsRoot, date, 'report.md'),
      snapshotPath
    }),
    siteBuilder: async () => ({
      indexPath: join(reportsRoot, 'site', 'index.html'),
      reportPages: [join(reportsRoot, 'site', 'reports', '2026-03-29', 'index.html')]
    })
  });

  assert.equal(result.status, 'site_built');
  assert.equal(result.reportPath, join(reportsRoot, '2026-03-29', 'report.json'));
  assert.equal(result.markdownPath, join(reportsRoot, '2026-03-29', 'report.md'));
});

test('runDaily builds the static site after generating the report', async () => {
  const mod = await import('../scripts/run-daily.js');
  const outputRoot = await mkdtemp(join(tmpdir(), 'builders-radar-run-'));
  const reportsRoot = await mkdtemp(join(tmpdir(), 'builders-radar-reports-'));
  const siteRoot = await mkdtemp(join(tmpdir(), 'builders-radar-site-'));

  const result = await mod.runDaily({
    argv: ['--date', '2026-03-29', '--dry-run'],
    outputRoot,
    reportsRoot,
    siteRoot,
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
    }),
    reportGenerator: async ({ date, snapshotPath }) => ({
      report: {
        date,
        title: 'AI Builders 中文日报 2026-03-29',
        summary: 'summary',
        sections: [],
        sourceStats: {
          builders: 0,
          tweets: 0,
          podcasts: 0,
          blogs: 0
        }
      },
      reportPath: join(reportsRoot, date, 'report.json'),
      markdownPath: join(reportsRoot, date, 'report.md'),
      snapshotPath
    }),
    siteBuilder: async () => ({
      indexPath: join(siteRoot, 'index.html'),
      reportPages: [join(siteRoot, 'reports', '2026-03-29', 'index.html')]
    })
  });

  assert.equal(result.status, 'site_built');
  assert.equal(result.indexPath, join(siteRoot, 'index.html'));
  assert.equal(result.reportPages[0], join(siteRoot, 'reports', '2026-03-29', 'index.html'));
});

test('runDaily reuses an existing snapshot in rebuild-only mode without fetching again', async () => {
  const mod = await import('../scripts/run-daily.js');
  const outputRoot = await mkdtemp(join(tmpdir(), 'builders-radar-run-'));
  const reportsRoot = await mkdtemp(join(tmpdir(), 'builders-radar-reports-'));
  const siteRoot = await mkdtemp(join(tmpdir(), 'builders-radar-site-'));
  const snapshotDir = join(outputRoot, '2026-03-29');
  const snapshotPath = join(snapshotDir, 'follow-builders.json');

  await mkdir(snapshotDir, { recursive: true });
  await writeFile(snapshotPath, JSON.stringify({
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
  }, null, 2));

  const result = await mod.runDaily({
    argv: ['--date', '2026-03-29', '--rebuild-only'],
    outputRoot,
    reportsRoot,
    siteRoot,
    fetchSnapshot: async () => {
      assert.fail('fetchSnapshot should not be called in rebuild-only mode');
    },
    reportGenerator: async ({ snapshotPath: receivedSnapshotPath }) => ({
      report: {
        date: '2026-03-29',
        title: 'AI Builders 中文日报 2026-03-29',
        summary: 'summary',
        sections: [],
        sourceStats: {
          builders: 0,
          tweets: 0,
          podcasts: 0,
          blogs: 0
        }
      },
      reportPath: join(reportsRoot, '2026-03-29', 'report.json'),
      markdownPath: join(reportsRoot, '2026-03-29', 'report.md'),
      snapshotPath: receivedSnapshotPath
    }),
    siteBuilder: async () => ({
      indexPath: join(siteRoot, 'index.html'),
      reportPages: [join(siteRoot, 'reports', '2026-03-29', 'index.html')]
    })
  });

  assert.equal(result.snapshotPath, snapshotPath);
  assert.equal(result.options.rebuildOnly, true);
});
