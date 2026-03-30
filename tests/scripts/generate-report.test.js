import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('generateReport reads a snapshot and writes report JSON and Markdown artifacts', async () => {
  let mod;

  try {
    mod = await import('../../scripts/generate-report.js');
  } catch (error) {
    assert.fail(`generate-report module is missing: ${error.message}`);
  }

  const workspace = await mkdtemp(join(tmpdir(), 'builders-radar-report-'));
  const rawRoot = join(workspace, 'raw');
  const reportsRoot = join(workspace, 'reports');
  const snapshotDir = join(rawRoot, '2026-03-29');
  const snapshotPath = join(snapshotDir, 'follow-builders.json');

  await mkdir(snapshotDir, { recursive: true });
  await writeFile(snapshotPath, JSON.stringify({
    source: 'follow-builders',
    fetchedAt: '2026-03-29T09:00:00.000Z',
    feedGeneratedAt: '2026-03-29T06:00:00.000Z',
    feeds: {
      x: {
        generatedAt: '2026-03-29T06:00:00.000Z',
        x: [
          {
            name: 'Aaron Levie',
            handle: 'levie',
            tweets: [
              {
                id: 'tweet-noise',
                text: 'Here we go',
                url: 'https://x.com/levie/status/tweet-noise',
                createdAt: '2026-03-29T04:00:00.000Z',
                isQuote: false
              },
              {
                id: 'tweet-1',
                text: 'Context is the hard part of enterprise agents.',
                url: 'https://x.com/levie/status/tweet-1',
                createdAt: '2026-03-29T05:00:00.000Z',
                isQuote: false
              },
              {
                id: 'tweet-quote',
                text: 'Wow!',
                url: 'https://x.com/levie/status/tweet-quote',
                createdAt: '2026-03-29T05:30:00.000Z',
                isQuote: true,
                quotedTweetId: 'quoted-1'
              }
            ]
          }
        ]
      },
      podcasts: {
        generatedAt: '2026-03-29T06:00:00.000Z',
        podcasts: []
      },
      blogs: {
        generatedAt: '2026-03-29T06:00:00.000Z',
        blogs: []
      }
    },
    stats: {
      builders: 1,
      tweets: 1,
      podcasts: 0,
      blogs: 0
    }
  }, null, 2));

  const result = await mod.generateReport({
    date: '2026-03-29',
    snapshotPath,
    reportsRoot,
    codexRunner: async ({ prompt }) => {
      assert.match(prompt, /2026-03-29/);
      assert.match(prompt, /Aaron Levie/);
      assert.doesNotMatch(prompt, /tweet-noise/);
      assert.doesNotMatch(prompt, /Here we go/);
      assert.match(prompt, /tweet-quote/);
      assert.match(prompt, /"isEmpty": true/);
      assert.match(prompt, /Context is the hard part of enterprise agents/);

      return {
        date: '2026-03-29',
        title: 'AI Builders 中文日报 2026-03-29',
        summary: '今天的 builders 动态集中在 agent 上下文与企业工作流。',
        sections: [
          {
            id: 'x-builders',
            title: 'X / Twitter 建设者动态',
            summary: 'X 动态主要围绕 enterprise agent 的上下文问题。',
            items: [
              {
                headline: 'Aaron Levie 谈 enterprise agents 的上下文瓶颈',
                summary: '他认为 agent 自动化落地的关键限制不在模型，而在上下文访问与权限体系。',
                sourceLinks: ['https://x.com/levie/status/tweet-1']
              }
            ]
          }
        ],
        sourceStats: {
          builders: 1,
          tweets: 1,
          podcasts: 0,
          blogs: 0
        }
      };
    }
  });

  assert.equal(result.reportPath, join(reportsRoot, '2026-03-29', 'report.json'));
  assert.equal(result.markdownPath, join(reportsRoot, '2026-03-29', 'report.md'));

  const reportJson = JSON.parse(await readFile(result.reportPath, 'utf8'));
  const reportMd = await readFile(result.markdownPath, 'utf8');

  assert.equal(reportJson.title, 'AI Builders 中文日报 2026-03-29');
  assert.match(reportMd, /AI Builders 中文日报 2026-03-29/);
  assert.match(reportMd, /Aaron Levie/);
  assert.match(reportMd, /https:\/\/x\.com\/levie\/status\/tweet-1/);
});

test('resolveEntrypointUrl normalizes a relative generate-report script path', async () => {
  const mod = await import('../../scripts/generate-report.js');
  const resolved = mod.resolveEntrypointUrl('scripts/generate-report.js');

  assert.match(resolved, /^file:\/\/\/[A-Za-z]:\/.*scripts\/generate-report\.js$/);
});

test('buildReportPrompt aligns section instructions with the report schema', async () => {
  const mod = await import('../../scripts/generate-report.js');
  const prompts = await mod.loadPromptSet();
  const prompt = mod.buildReportPrompt({
    date: '2026-03-29',
    reportInput: {
      source: 'follow-builders',
      sourceStats: {
        builders: 1,
        tweets: 1,
        podcasts: 0,
        blogs: 0
      },
      x: { builders: [], isEmpty: true },
      podcasts: { items: [], isEmpty: true },
      blogs: { items: [], isEmpty: true }
    },
    prompts
  });

  assert.doesNotMatch(prompt, /Short closing note with source coverage counts/i);
  assert.match(prompt, /Do not put coverage counts inside any section summary/i);
  assert.match(prompt, /The canonical coverage counts already live in sourceStats/i);
});
