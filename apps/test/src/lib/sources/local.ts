import { JsSource } from '@arql/source-js';
import { functions, transforms } from '@arql/stdlib-js';
import { dataTypes } from '@arql/types';

export const localTestSource = new JsSource({
  models: [
    {
      name: 'users',
      fields: [
        {
          name: 'name',
          dataType: dataTypes.string,
          sourceDataType: 'string',
        },
        {
          name: 'alias',
          dataType: dataTypes.string,
          sourceDataType: 'string',
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
  transforms,
});
