import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

test('spawnCodex ignores stdin EOF when the codex child exits cleanly', async () => {
  const mod = await import('../../scripts/lib/codex.js');

  assert.equal(typeof mod.spawnCodex, 'function');

  const stdin = new EventEmitter();
  stdin.end = (input) => {
    stdin.input = input;
    queueMicrotask(() => {
      const error = new Error('write EOF');
      error.code = 'EOF';
      stdin.emit('error', error);
    });
  };

  const stderr = new EventEmitter();
  const child = new EventEmitter();
  child.stdin = stdin;
  child.stderr = stderr;

  const spawnPromise = mod.spawnCodex(['exec', '-'], 'prompt body', process.cwd(), {
    spawnImpl: () => child
  });

  queueMicrotask(() => {
    child.emit('close', 0);
  });

  await assert.doesNotReject(spawnPromise);
  assert.equal(stdin.input, 'prompt body');
});
