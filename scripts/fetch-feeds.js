#!/usr/bin/env node

import { fetchFollowBuildersFeeds } from '../adapters/follow-builders.js';

async function main() {
  const snapshot = await fetchFollowBuildersFeeds();
  console.log(JSON.stringify(snapshot, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
