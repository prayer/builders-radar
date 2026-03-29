#!/usr/bin/env node

import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_REPORTS_ROOT = join(process.cwd(), 'data', 'reports');
const DEFAULT_SITE_ROOT = join(process.cwd(), 'site-output');
const SHARED_CSS_PATH = join(process.cwd(), 'site', 'templates', 'shared.css');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderChips(report) {
  return [
    ['Builders', report.sourceStats.builders],
    ['Tweets', report.sourceStats.tweets],
    ['Podcasts', report.sourceStats.podcasts],
    ['Blogs', report.sourceStats.blogs]
  ].map(([label, value]) => `<span class="chip"><strong>${label}</strong> ${value}</span>`).join('');
}

function renderIndexHtml(reports) {
  const latest = reports[0];
  const reportCards = reports.map((report) => `
    <article class="report-card">
      <div class="meta">${escapeHtml(report.date)}</div>
      <h2><a href="./reports/${encodeURIComponent(report.date)}/">${escapeHtml(report.title)}</a></h2>
      <p>${escapeHtml(report.summary)}</p>
      <div class="chip-row">${renderChips(report)}</div>
    </article>
  `).join('');

  const latestSummary = latest
    ? `
      <div class="stat-grid" aria-label="Latest report stats">
        <div class="stat-card"><span class="eyebrow">Latest Date</span><strong>${escapeHtml(latest.date)}</strong></div>
        <div class="stat-card"><span class="eyebrow">Tracked Builders</span><strong>${latest.sourceStats.builders}</strong></div>
        <div class="stat-card"><span class="eyebrow">Source Tweets</span><strong>${latest.sourceStats.tweets}</strong></div>
        <div class="stat-card"><span class="eyebrow">Sections</span><strong>${latest.sections.length}</strong></div>
      </div>
    `
    : '<div class="panel"><p>暂无日报。先运行本地 daily 流程生成第一篇报告。</p></div>';

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Builders Radar</title>
    <meta name="description" content="Local-first AI builders daily report archive">
    <link rel="stylesheet" href="./shared.css">
  </head>
  <body>
    <a class="skip-link" href="#content">跳到内容</a>
    <main id="content" class="shell">
      <section class="hero">
        <div class="hero-grid">
          <div>
            <div class="eyebrow">Local-first AI daily archive</div>
            <h1>Builders Radar</h1>
            <p>每天一篇中文 Builders 日报。当前阶段聚焦 follow-builders 这一路上游 feed，先把高信号动态整理成可归档、可回看、可后续扩展的静态站。</p>
          </div>
          ${latestSummary}
        </div>
      </section>

      <section class="panel" style="margin-top: 24px;">
        <div class="report-header">
          <div class="eyebrow">Reports</div>
          <h2>日报归档</h2>
        </div>
        <div class="report-list" style="margin-top: 18px;">
          ${reportCards || '<p>暂无日报。先运行本地 daily 流程生成第一篇报告。</p>'}
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function renderSection(section) {
  const items = section.items.length > 0
    ? section.items.map((item) => `
      <article class="item-card">
        <h3>${escapeHtml(item.headline)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        ${item.sourceLinks.length > 0 ? `<ul>${item.sourceLinks.map((link) => `<li><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></li>`).join('')}</ul>` : ''}
      </article>
    `).join('')
    : '<article class="item-card"><p>本节当前没有具体条目。</p></article>';

  return `
    <section class="panel section-block" id="${escapeHtml(section.id)}">
      <div>
        <div class="eyebrow">${escapeHtml(section.id)}</div>
        <h2>${escapeHtml(section.title)}</h2>
      </div>
      <p>${escapeHtml(section.summary)}</p>
      <div class="section-list">
        ${items}
      </div>
    </section>
  `;
}

function renderReportHtml(report) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(report.title)}</title>
    <meta name="description" content="${escapeHtml(report.summary)}">
    <link rel="stylesheet" href="../../shared.css">
  </head>
  <body>
    <a class="skip-link" href="#content">跳到内容</a>
    <main id="content" class="shell">
      <section class="hero report-header">
        <div class="eyebrow">${escapeHtml(report.date)}</div>
        <h1>${escapeHtml(report.title)}</h1>
        <p>${escapeHtml(report.summary)}</p>
        <div class="chip-row">${renderChips(report)}</div>
        <p class="footer-note"><a href="../../index.html">返回归档首页</a></p>
      </section>
      ${report.sections.map(renderSection).join('\n')}
    </main>
  </body>
</html>`;
}

async function readReports(reportsRoot) {
  const entries = await readdir(reportsRoot, { withFileTypes: true });
  const reports = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const reportPath = join(reportsRoot, entry.name, 'report.json');

    try {
      const report = JSON.parse(await readFile(reportPath, 'utf8'));
      reports.push(report);
    } catch {
      // Ignore incomplete report directories for now.
    }
  }

  reports.sort((a, b) => b.date.localeCompare(a.date));
  return reports;
}

export async function buildSite({
  reportsRoot = DEFAULT_REPORTS_ROOT,
  siteRoot = DEFAULT_SITE_ROOT
} = {}) {
  const reports = await readReports(reportsRoot);
  const siteDataRoot = join(siteRoot, 'site-data');
  const siteDataReportsRoot = join(siteDataRoot, 'reports');
  const reportPages = [];

  await mkdir(siteRoot, { recursive: true });
  await mkdir(siteDataReportsRoot, { recursive: true });
  await copyFile(SHARED_CSS_PATH, join(siteRoot, 'shared.css'));
  await writeFile(join(siteRoot, 'index.html'), renderIndexHtml(reports));
  await writeFile(join(siteDataRoot, 'reports.json'), JSON.stringify(reports, null, 2));

  for (const report of reports) {
    const reportRoot = join(siteRoot, 'reports', report.date);
    const reportPagePath = join(reportRoot, 'index.html');

    await mkdir(reportRoot, { recursive: true });
    await writeFile(reportPagePath, renderReportHtml(report));
    await writeFile(join(siteDataReportsRoot, `${report.date}.json`), JSON.stringify(report, null, 2));
    reportPages.push(reportPagePath);
  }

  return {
    indexPath: join(siteRoot, 'index.html'),
    reportPages
  };
}

export function resolveEntrypointUrl(scriptPath) {
  if (!scriptPath) {
    return null;
  }

  return pathToFileURL(resolve(scriptPath)).href;
}

async function main() {
  const result = await buildSite();
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === resolveEntrypointUrl(process.argv[1])) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
