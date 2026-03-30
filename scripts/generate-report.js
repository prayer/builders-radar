#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runCodexReport } from './lib/codex.js';
import { prepareReportInput } from './lib/report-input.js';

const DEFAULT_PROMPTS_DIR = join(process.cwd(), 'prompts');
const DEFAULT_REPORTS_ROOT = join(process.cwd(), 'data', 'reports');

async function loadPrompt(promptsDir, filename) {
  return readFile(join(promptsDir, filename), 'utf8');
}

export function resolveEntrypointUrl(scriptPath) {
  if (!scriptPath) {
    return null;
  }

  return pathToFileURL(resolve(scriptPath)).href;
}

export async function loadPromptSet(promptsDir = DEFAULT_PROMPTS_DIR) {
  const [
    reportSystem,
    reportUser,
    summarizeX,
    summarizePodcast,
    summarizeBlogs,
    translateZh
  ] = await Promise.all([
    loadPrompt(promptsDir, 'report-system.md'),
    loadPrompt(promptsDir, 'report-user.md'),
    loadPrompt(promptsDir, 'summarize-x.md'),
    loadPrompt(promptsDir, 'summarize-podcast.md'),
    loadPrompt(promptsDir, 'summarize-blogs.md'),
    loadPrompt(promptsDir, 'translate-zh.md')
  ]);

  return {
    reportSystem,
    reportUser,
    summarizeX,
    summarizePodcast,
    summarizeBlogs,
    translateZh
  };
}

export function buildReportPrompt({ date, reportInput, prompts }) {
  return [
    prompts.reportSystem.trim(),
    '',
    prompts.reportUser.trim(),
    '',
    '## Section Prompts',
    '',
    '### X',
    prompts.summarizeX.trim(),
    '',
    '### Podcasts',
    prompts.summarizePodcast.trim(),
    '',
    '### Blogs',
    prompts.summarizeBlogs.trim(),
    '',
    '### Translation',
    prompts.translateZh.trim(),
    '',
    '## Report Date',
    date,
    '',
    '## Report Input JSON',
    JSON.stringify(reportInput, null, 2),
    '',
    'Return only the final report JSON that matches the provided schema.'
  ].join('\n');
}

export function renderReportMarkdown(report) {
  const lines = [
    `# ${report.title}`,
    '',
    report.summary,
    ''
  ];

  for (const section of report.sections) {
    lines.push(`## ${section.title}`, '', section.summary, '');

    for (const item of section.items) {
      lines.push(`### ${item.headline}`, '', item.summary, '');

      for (const link of item.sourceLinks) {
        lines.push(link);
      }

      lines.push('');
    }
  }

  lines.push(
    '## Source Stats',
    '',
    `- Builders: ${report.sourceStats.builders}`,
    `- Tweets: ${report.sourceStats.tweets}`,
    `- Podcasts: ${report.sourceStats.podcasts}`,
    `- Blogs: ${report.sourceStats.blogs}`,
    ''
  );

  return lines.join('\n');
}

export async function generateReport({
  date,
  snapshotPath,
  reportsRoot = DEFAULT_REPORTS_ROOT,
  promptsDir = DEFAULT_PROMPTS_DIR,
  codexRunner = runCodexReport
}) {
  const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
  const prompts = await loadPromptSet(promptsDir);
  const reportInput = prepareReportInput(snapshot);
  const prompt = buildReportPrompt({ date, reportInput, prompts });
  const report = await codexRunner({ prompt });
  const outputDir = join(reportsRoot, date);
  const reportPath = join(outputDir, 'report.json');
  const markdownPath = join(outputDir, 'report.md');
  const markdown = renderReportMarkdown(report);

  await mkdir(outputDir, { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  await writeFile(markdownPath, markdown);

  return {
    report,
    reportPath,
    markdownPath
  };
}

async function main(argv = process.argv.slice(2)) {
  const date = argv[0];

  if (!date) {
    throw new Error('Usage: node scripts/generate-report.js <YYYY-MM-DD> [snapshot-path]');
  }

  const snapshotPath = argv[1] || join(process.cwd(), 'data', 'raw', date, 'follow-builders.json');
  const result = await generateReport({ date, snapshotPath });

  console.log(JSON.stringify({
    status: 'report_generated',
    reportPath: result.reportPath,
    markdownPath: result.markdownPath
  }, null, 2));
}

const isDirectRun = import.meta.url === resolveEntrypointUrl(process.argv[1]);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
