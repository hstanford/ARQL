import { test } from './lib';

const out = test('(test, test) | filter(foo = $1) {bar}');

/*console.log(
  JSON.stringify(out.delegatedQuery.def, null, 2),
  JSON.stringify(
    out.subQueries.map((s) => s.def),
    null,
    2
  )
);*/

console.log(out.delegatedQuery, out.subQueries);
