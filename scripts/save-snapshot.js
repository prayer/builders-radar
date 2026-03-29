import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DEFAULT_OUTPUT_ROOT = join(process.cwd(), 'data', 'raw');

export async function saveSnapshot({
  outputRoot = DEFAULT_OUTPUT_ROOT,
  date,
  snapshot
}) {
  const directory = join(outputRoot, date);
  const filePath = join(directory, `${snapshot.source}.json`);

  await mkdir(directory, { recursive: true });
  await writeFile(filePath, JSON.stringify(snapshot, null, 2));

  return filePath;
}
