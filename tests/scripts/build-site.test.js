import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('buildSite generates an index page, a report detail page, and site-data JSON', async () => {
  let mod;

  try {
    mod = await import('../../scripts/build-site.js');
  } catch (error) {
    assert.fail(`build-site module is missing: ${error.message}`);
  }

  const workspace = await mkdtemp(join(tmpdir(), 'builders-radar-site-'));
  const reportsRoot = join(workspace, 'reports');
  const siteRoot = join(workspace, 'site-output');
  const reportDir = join(reportsRoot, '2026-03-29');

  await mkdir(reportDir, { recursive: true });
  await writeFile(join(reportDir, 'report.json'), JSON.stringify({
    date: '2026-03-29',
    title: 'AI Builders 中文日报 2026-03-29',
    summary: '今天的主题是 agent 可靠性与上下文管理。',
    sections: [
      {
        id: 'x-builders',
        title: 'X / Twitter 建设者动态',
        summary: 'Builders 主要在讨论 agent 的工程可靠性。',
        items: [
          {
            headline: 'Peter Steinberger 更新 MCPorter 0.8.0',
            summary: '更新集中在 OAuth、JSON fallback 和 daemon 稳定性。',
            sourceLinks: ['https://x.com/steipete/status/123']
          }
        ]
      },
      {
        id: 'blogs',
        title: 'Blogs',
        summary: '今天没有有意义的官方博客更新。',
        items: []
      }
    ],
    sourceStats: {
      builders: 6,
      tweets: 12,
      podcasts: 0,
      blogs: 0
    }
  }, null, 2));

  const result = await mod.buildSite({
    reportsRoot,
    siteRoot
  });

  assert.equal(result.indexPath, join(siteRoot, 'index.html'));
  assert.equal(result.reportPages[0], join(siteRoot, 'reports', '2026-03-29', 'index.html'));

  const indexHtml = await readFile(result.indexPath, 'utf8');
  const detailHtml = await readFile(result.reportPages[0], 'utf8');
  const reportsIndex = JSON.parse(await readFile(join(siteRoot, 'site-data', 'reports.json'), 'utf8'));
  const reportJson = JSON.parse(await readFile(join(siteRoot, 'site-data', 'reports', '2026-03-29.json'), 'utf8'));

  assert.match(indexHtml, /AI Builders 中文日报 2026-03-29/);
  assert.match(indexHtml, /今天的主题是 agent 可靠性与上下文管理/);
  assert.match(detailHtml, /MCPorter 0\.8\.0/);
  assert.match(detailHtml, /https:\/\/x\.com\/steipete\/status\/123/);
  assert.match(detailHtml, /class="detail-header-grid"/);
  assert.match(detailHtml, /class="source-stats-panel"/);
  assert.match(detailHtml, /class="section-nav"/);
  assert.match(detailHtml, /href="#x-builders"/);
  assert.match(detailHtml, /href="#blogs"/);
  assert.doesNotMatch(detailHtml, /class="chip-row"/);
  assert.equal(reportsIndex[0].date, '2026-03-29');
  assert.equal(reportJson.title, 'AI Builders 中文日报 2026-03-29');
});
