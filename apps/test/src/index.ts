import { test } from './lib';

const out = await test(
  `(
      test | filter(foo = $1 || bar = $2) {
        baz: bar
      }
    ) {
      baz
    }`,
  ['Joe', 'Blogs']
);
console.log(out);
process.exit(0);
