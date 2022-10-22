import { test } from './lib';

const out = test('test | filter(foo = $1) {bar}');

console.log(JSON.stringify(out.def, null, 2));
