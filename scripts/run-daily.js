#!/usr/bin/env node

import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fetchFollowBuildersFeeds } from '../adapters/follow-builders.js';
import { saveSnapshot } from './save-snapshot.js';
import { generateReport } from './generate-report.js';
import { buildSite } from './build-site.js';
import { publishSite } from './publish-site.js';

function takeValue(args, index, flag) {
  const value = args[index + 1];

  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }

  return value;
}

export function resolveEntrypointUrl(scriptPath) {
  if (!scriptPath) {
    return null;
  }

  return pathToFileURL(resolve(scriptPath)).href;
}

function resolveSnapshotPath(outputRoot, date) {
  const root = outputRoot ?? join(process.cwd(), 'data', 'raw');
  return join(root, date, 'follow-builders.json');
}

export function parseRunOptions(args) {
  const options = {
    date: null,
    dryRun: false,
    rebuildOnly: false,
    publish: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case '--date':
        options.date = takeValue(args, index, '--date');
        index += 1;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--rebuild-only':
        options.rebuildOnly = true;
        break;
      case '--publish':
        options.publish = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

export async function runDaily({
  argv = [],
  outputRoot,
  reportsRoot,
  siteRoot,
  baseUrl = process.env.BUILDERS_RADAR_BASE_URL,
  fetchSnapshot = (options) => fetchFollowBuildersFeeds({ baseUrl, ...options }),
  reportGenerator = generateReport,
  siteBuilder = buildSite,
  publisher = publishSite
} = {}) {
  const options = parseRunOptions(argv);
  const effectiveDate = options.date ?? new Date().toISOString().slice(0, 10);
  let snapshot;
  let snapshotPath;

  if (options.rebuildOnly) {
    snapshotPath = resolveSnapshotPath(outputRoot, effectiveDate);
    await access(snapshotPath, constants.F_OK);
  } else {
    snapshot = await fetchSnapshot({ date: effectiveDate });
    snapshotPath = await saveSnapshot({
      outputRoot,
      date: effectiveDate,
      snapshot
    });
  }

  const reportResult = await reportGenerator({
    date: effectiveDate,
    snapshotPath,
    reportsRoot
  });
  const siteResult = await siteBuilder({
    reportsRoot,
    siteRoot
  });
  const publishResult = options.publish
    ? await publisher({ siteRoot: siteRoot ?? join(process.cwd(), 'site-output') })
    : null;

  return {
    status: 'site_built',
    options: {
      ...options,
      date: effectiveDate
    },
    snapshotPath,
    reportPath: reportResult.reportPath,
    markdownPath: reportResult.markdownPath,
    indexPath: siteResult.indexPath,
    reportPages: siteResult.reportPages,
    publishRoot: publishResult?.publishRoot,
    stats: snapshot?.stats
  };
}

export async function main(argv = process.argv.slice(2)) {
  const result = await runDaily({
    argv,
    outputRoot: process.env.BUILDERS_RADAR_OUTPUT_ROOT
  });

  console.log(JSON.stringify(result, null, 2));
}

const entrypointUrl = resolveEntrypointUrl(process.argv[1]);
const isDirectRun = import.meta.url === entrypointUrl;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
