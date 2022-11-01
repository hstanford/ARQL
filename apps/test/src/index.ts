import { test } from './lib';

(async () => {
  const out = await test(
    '(test | filter(foo = $1 || bar = $2) {baz: bar}) {baz}',
    [7, 8]
  );
  console.log(out);
})();
