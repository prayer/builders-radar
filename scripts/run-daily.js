#!/usr/bin/env node

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fetchFollowBuildersFeeds } from '../adapters/follow-builders.js';
import { saveSnapshot } from './save-snapshot.js';

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
  baseUrl = process.env.BUILDERS_RADAR_BASE_URL,
  fetchSnapshot = (options) => fetchFollowBuildersFeeds({ baseUrl, ...options })
} = {}) {
  const options = parseRunOptions(argv);
  const effectiveDate = options.date ?? new Date().toISOString().slice(0, 10);
  const snapshot = await fetchSnapshot({ date: effectiveDate });
  const snapshotPath = await saveSnapshot({
    outputRoot,
    date: effectiveDate,
    snapshot
  });

  return {
    status: 'snapshot_saved',
    options: {
      ...options,
      date: effectiveDate
    },
    snapshotPath,
    stats: snapshot.stats
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
