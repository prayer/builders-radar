#!/usr/bin/env node

import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const DEFAULT_SITE_ROOT = join(process.cwd(), 'site-output');
const CONFIG_PATH = join(process.cwd(), 'config', 'publish.config.json');

export function resolveEntrypointUrl(scriptPath) {
  if (!scriptPath) {
    return null;
  }

  return pathToFileURL(resolve(scriptPath)).href;
}

export async function loadPublishConfig(configPath = CONFIG_PATH) {
  if (!existsSync(configPath)) {
    return null;
  }

  return JSON.parse(await readFile(configPath, 'utf8'));
}

async function emptyDirectory(directory) {
  if (!existsSync(directory)) {
    await mkdir(directory, { recursive: true });
    return;
  }

  const entries = await stat(directory);

  if (!entries.isDirectory()) {
    throw new Error(`Publish destination is not a directory: ${directory}`);
  }

  const children = await import('node:fs/promises').then((fs) => fs.readdir(directory, { withFileTypes: true }));

  for (const child of children) {
    if (child.name === '.git') {
      continue;
    }

    const childPath = join(directory, child.name);
    await rm(childPath, { recursive: true, force: true });
  }
}

function runGit(args, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code !== 0) {
        rejectPromise(new Error(stderr.trim() || `git exited with code ${code}`));
        return;
      }

      resolvePromise({ code, stdout, stderr });
    });
  });
}

export async function publishSite({
  siteRoot = DEFAULT_SITE_ROOT,
  targetRepoPath,
  targetSubdir = '',
  publishBranch,
  gitCommit = true,
  gitPush = false,
  commitMessage = 'chore: publish builders-radar site',
  gitRunner = (args, cwd) => runGit(args, cwd)
} = {}) {
  const config = await loadPublishConfig();
  const resolvedTargetRepoPath = targetRepoPath || config?.targetRepoPath;
  const resolvedTargetSubdir = targetSubdir || config?.targetSubdir || '';
  const resolvedPublishBranch = publishBranch || config?.branch || null;
  const resolvedGitPush = gitPush || config?.push || false;
  const resolvedCommitMessage = commitMessage || config?.commitMessage || 'chore: publish builders-radar site';

  if (!resolvedTargetRepoPath) {
    throw new Error('Missing publish target repo path. Set config/publish.config.json or pass targetRepoPath.');
  }

  const publishRoot = resolvedTargetSubdir
    ? join(resolvedTargetRepoPath, resolvedTargetSubdir)
    : resolvedTargetRepoPath;

  await mkdir(publishRoot, { recursive: true });
  await emptyDirectory(publishRoot);
  await cp(siteRoot, publishRoot, { recursive: true });
  await writeFile(join(publishRoot, '.nojekyll'), '');

  if (gitCommit) {
    await gitRunner(['add', '.'], resolvedTargetRepoPath);
    await gitRunner(['commit', '-m', resolvedCommitMessage], resolvedTargetRepoPath).catch(async (error) => {
      const status = await gitRunner(['status', '--short'], resolvedTargetRepoPath);

      if (status.stdout.trim().length === 0) {
        return;
      }

      throw error;
    });

    if (resolvedGitPush) {
      const pushArgs = resolvedPublishBranch
        ? ['push', '--set-upstream', 'origin', resolvedPublishBranch]
        : ['push'];
      await gitRunner(pushArgs, resolvedTargetRepoPath);
    }
  }

  return {
    publishRoot
  };
}

function parseArgs(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case '--repo-path':
        options.targetRepoPath = args[index + 1];
        index += 1;
        break;
      case '--subdir':
        options.targetSubdir = args[index + 1];
        index += 1;
        break;
      case '--no-commit':
        options.gitCommit = false;
        break;
      case '--push':
        options.gitPush = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function main(argv = process.argv.slice(2)) {
  const result = await publishSite(parseArgs(argv));
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === resolveEntrypointUrl(process.argv[1])) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
