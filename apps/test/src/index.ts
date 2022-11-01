import { test } from './lib';

(async () => {
  const out = await test(
    '(test | filter(foo = $1 || bar = $2) {baz: bar}) {baz}'
  );
  for (const query of out.subQueries) {
    const source = query.requirements.sources[0];
    const resolved = await source.resolve(query, [7, 8]);
    console.log(resolved);
  }
  console.log(out.delegatedQuery);
})();
