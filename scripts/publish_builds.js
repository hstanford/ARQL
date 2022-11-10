import { execSync } from 'child_process';
import { readdir, stat } from 'fs/promises';

const packagesDir = new URL('../dist/packages', import.meta.url);
for (const item of await readdir(packagesDir)) {
  const itemUrl = new URL(item, packagesDir + '/');

  // assert the item is a directory
  const stats = await stat(itemUrl);
  if (!stats.isDirectory()) {
    continue;
  }

  const out = execSync('npm publish --access=public', {
    cwd: itemUrl.pathname,
    encoding: 'utf8',
  });
  console.log(out);
}
