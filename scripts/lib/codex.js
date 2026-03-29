import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const REPORT_SCHEMA = {
  type: 'object',
  required: ['date', 'title', 'summary', 'sections', 'sourceStats'],
  additionalProperties: false,
  properties: {
    date: { type: 'string' },
    title: { type: 'string' },
    summary: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'summary', 'items'],
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['headline', 'summary', 'sourceLinks'],
              additionalProperties: false,
              properties: {
                headline: { type: 'string' },
                summary: { type: 'string' },
                sourceLinks: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    sourceStats: {
      type: 'object',
      required: ['builders', 'tweets', 'podcasts', 'blogs'],
      additionalProperties: false,
      properties: {
        builders: { type: 'number' },
        tweets: { type: 'number' },
        podcasts: { type: 'number' },
        blogs: { type: 'number' }
      }
    }
  }
};

function spawnCodex(args, input, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('codex', args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false
    });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code !== 0) {
        rejectPromise(new Error(stderr.trim() || `codex exited with code ${code}`));
        return;
      }

      resolvePromise();
    });

    child.stdin.end(input);
  });
}

export async function runCodexReport({ prompt, cwd = process.cwd() }) {
  const tempDir = await mkdtemp(join(tmpdir(), 'builders-radar-codex-'));
  const schemaPath = join(tempDir, 'report-schema.json');
  const outputPath = join(tempDir, 'report.json');

  try {
    await writeFile(schemaPath, JSON.stringify(REPORT_SCHEMA, null, 2));

    await spawnCodex([
      'exec',
      '-',
      '--skip-git-repo-check',
      '--sandbox',
      'read-only',
      '--color',
      'never',
      '--output-schema',
      schemaPath,
      '--output-last-message',
      outputPath
    ], prompt, cwd);

    return JSON.parse(await readFile(outputPath, 'utf8'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
