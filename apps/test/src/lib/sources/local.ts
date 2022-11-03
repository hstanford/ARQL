import { JsSource } from '@arql/source-js';
import { functions, operators, transforms } from '@arql/stdlib-js';

export const localTestSource = new JsSource({
  models: [
    {
      name: 'users',
      fields: [
        {
          name: 'name',
          datatype: 'string' as const,
        },
        {
          name: 'alias',
          datatype: 'string' as const,
        },
      ],
    },
  ],
  data: new Map([
    [
      'users',
      [
        { name: 'jack', alias: 'j' },
        { name: 'alan', alias: 'a' },
        { name: 'Joe', alias: 'JJ' },
      ],
    ],
  ]),
  functions,
  operators,
  transforms,
});
