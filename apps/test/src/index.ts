import { test } from './lib';

const out = await test(
  `(
      test | filter(foo = $1 || bar = $2) | sort(bar) {
        baz: bar
      }
    ) {
      baz
    }`,
  ['Joe', 'Doe']
);
console.log(out);
process.exit(0);
