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
