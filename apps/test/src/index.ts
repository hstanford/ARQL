import { test } from './lib/index.js';

type Query = [string, unknown[]];

const queries: Query[] = [
  [
    `
    (
      test | filter(foo = $1 || bar = $2) | sort(bar) {
        baz: bar
      }
    ) {
      baz
    }
    `,
    ['Joe', 'Doe'],
  ],
  [`users | filter(name = $1) {name}`, ['alan']],
  [
    `
    (
      u: users,
      t: test
    ) | join(u.name = t.foo) {
      firstName: u.name,
      lastName: t.bar,
      u.alias
    }`,
    [],
  ],
  [
    `
    (test, other_users) | join(test.bar = other_users.last_name) {first_name, foo, bar}
    `,
    [],
  ],
  [
    `
    test | group(foo) { foo, maxAge: max(age) }
    `,
    [],
  ],
  [
    `
    products | filter(qty = $1) {
      item,
      q: qty + $2
    }
    `,
    [15, 1],
  ],
];

const out = await test(...queries[5]);
console.log(out);
process.exit(0);
