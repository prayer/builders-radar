import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('publishSite copies site output into a target repo directory and writes .nojekyll', async () => {
  let mod;

  try {
    mod = await import('../../scripts/publish-site.js');
  } catch (error) {
    assert.fail(`publish-site module is missing: ${error.message}`);
  }

  const workspace = await mkdtemp(join(tmpdir(), 'builders-radar-publish-'));
  const siteRoot = join(workspace, 'site-output');
  const targetRepoPath = join(workspace, 'pages-repo');

  await mkdir(join(siteRoot, 'reports', '2026-03-29'), { recursive: true });
  await mkdir(targetRepoPath, { recursive: true });
  await writeFile(join(siteRoot, 'index.html'), '<html>index</html>');
  await writeFile(join(siteRoot, 'reports', '2026-03-29', 'index.html'), '<html>detail</html>');

  const commands = [];
  const result = await mod.publishSite({
    siteRoot,
    targetRepoPath,
    gitCommit: false,
    gitRunner: async (args) => {
      commands.push(args);
      return { code: 0 };
    }
  });

  assert.equal(result.publishRoot, targetRepoPath);
  assert.equal(await readFile(join(targetRepoPath, 'index.html'), 'utf8'), '<html>index</html>');
  assert.equal(await readFile(join(targetRepoPath, 'reports', '2026-03-29', 'index.html'), 'utf8'), '<html>detail</html>');
  assert.equal(await readFile(join(targetRepoPath, '.nojekyll'), 'utf8'), '');
  assert.deepEqual(commands, []);
});

test('publishSite preserves the .git metadata entry when syncing into a repo root', async () => {
  const mod = await import('../../scripts/publish-site.js');
  const workspace = await mkdtemp(join(tmpdir(), 'builders-radar-publish-'));
  const siteRoot = join(workspace, 'site-output');
  const targetRepoPath = join(workspace, 'pages-repo');

  await mkdir(siteRoot, { recursive: true });
  await mkdir(targetRepoPath, { recursive: true });
  await writeFile(join(siteRoot, 'index.html'), '<html>index</html>');
  await writeFile(join(targetRepoPath, '.git'), 'gitdir: ../.git/worktrees/pages-repo');
  await writeFile(join(targetRepoPath, 'old.txt'), 'stale');

  await mod.publishSite({
    siteRoot,
    targetRepoPath,
    gitCommit: false
  });

  assert.equal(await readFile(join(targetRepoPath, '.git'), 'utf8'), 'gitdir: ../.git/worktrees/pages-repo');
  await assert.rejects(readFile(join(targetRepoPath, 'old.txt'), 'utf8'));
  assert.equal(await readFile(join(targetRepoPath, 'index.html'), 'utf8'), '<html>index</html>');
});

test('publishSite can push with upstream setup when a publish branch is configured', async () => {
  const mod = await import('../../scripts/publish-site.js');
  const workspace = await mkdtemp(join(tmpdir(), 'builders-radar-publish-'));
  const siteRoot = join(workspace, 'site-output');
  const targetRepoPath = join(workspace, 'pages-repo');
  const commands = [];

  await mkdir(siteRoot, { recursive: true });
  await mkdir(targetRepoPath, { recursive: true });
  await writeFile(join(siteRoot, 'index.html'), '<html>index</html>');
  await writeFile(join(targetRepoPath, '.git'), 'gitdir: ../.git/worktrees/pages-repo');

  await mod.publishSite({
    siteRoot,
    targetRepoPath,
    gitCommit: true,
    gitPush: true,
    publishBranch: 'gh-pages',
    gitRunner: async (args) => {
      commands.push(args);
      return { code: 0, stdout: '', stderr: '' };
    }
  });

  assert.deepEqual(commands, [
    ['add', '.'],
    ['commit', '-m', 'chore: publish builders-radar site'],
    ['push', '--set-upstream', 'origin', 'gh-pages']
  ]);
});

test('publishSite retries push after fetching when the remote branch moved but remains an ancestor of HEAD', async () => {
  const mod = await import('../../scripts/publish-site.js');
  const workspace = await mkdtemp(join(tmpdir(), 'builders-radar-publish-'));
  const siteRoot = join(workspace, 'site-output');
  const targetRepoPath = join(workspace, 'pages-repo');
  const commands = [];

  await mkdir(siteRoot, { recursive: true });
  await mkdir(targetRepoPath, { recursive: true });
  await writeFile(join(siteRoot, 'index.html'), '<html>index</html>');
  await writeFile(join(targetRepoPath, '.git'), 'gitdir: ../.git/worktrees/pages-repo');

  let pushAttempts = 0;

  await mod.publishSite({
    siteRoot,
    targetRepoPath,
    gitCommit: true,
    gitPush: true,
    publishBranch: 'gh-pages',
    gitRunner: async (args) => {
      commands.push(args);

      if (args[0] === 'push') {
        pushAttempts += 1;

        if (pushAttempts === 1) {
          throw new Error("remote rejected gh-pages -> gh-pages (cannot lock ref 'refs/heads/gh-pages': is at 67c2f8fe9cf59489d64dadd9f293b47b79f6171a but expected a3864e7706dd85ffa813fe9541af89172596b55d)");
        }
      }

      if (args[0] === 'merge-base') {
        return { code: 0, stdout: '', stderr: '' };
      }

      return { code: 0, stdout: '', stderr: '' };
    }
  });

  assert.deepEqual(commands, [
    ['add', '.'],
    ['commit', '-m', 'chore: publish builders-radar site'],
    ['push', '--set-upstream', 'origin', 'gh-pages'],
    ['fetch', 'origin', 'gh-pages'],
    ['merge-base', '--is-ancestor', 'origin/gh-pages', 'HEAD'],
    ['push', '--set-upstream', 'origin', 'gh-pages']
  ]);
});
