import { readdir, readFile, stat, writeFile } from 'fs/promises';

const packagesRelPath =
  process.env['BUILD_ENV'] === 'CI' ? '../dist/packages' : '../packages';

const packagesDir = new URL(packagesRelPath, import.meta.url);
for (const item of await readdir(packagesDir)) {
  const itemUrl = new URL(item, packagesDir + '/');

  // assert the item is a directory
  const stats = await stat(itemUrl);
  if (!stats.isDirectory()) {
    continue;
  }

  // get the package.json contents
  const packageUrl = new URL('package.json', itemUrl + '/');
  const packageFile = await readFile(packageUrl, 'utf8');
  const contents = JSON.parse(packageFile);

  // update the version number
  contents.version = process.argv[2];

  // write the new contents in place
  const outputPackage = JSON.stringify(contents, null, 2) + '\n';
  await writeFile(packageUrl, outputPackage);
}
