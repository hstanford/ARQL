import { TransformDef } from '@arql/models';

export const functions: TransformDef[] = [
  {
    // an aggregate function, passed a field name
    // get the maximum value of a field over a set of rows
    // e.g. test | group(foo) { foo, bar: max(bar) }
    name: 'max',
    nArgs: '1',
  },
  {
    // an aggregate function, passed a field name
    // get the minimum value of a field over a set of rows
    // e.g. test | group(foo) { foo, bar: min(bar) }
    name: 'min',
    nArgs: '1',
  },
  {
    // an aggregate function, passed a field name
    // get the total number of records for this field
    // e.g. test | group(foo) { foo, nBar: count.distinct(bar) }
    name: 'count',
    nArgs: '1',
    modifiers: ['distinct'], // if "distinct" only count unique values
  },
  {
    // an aggregate function, passed a field name
    // get an array aggregation of all the values
    // e.g. test | group(foo) { foo, bar: array(bar) }
    name: 'array',
    nArgs: '1',
  },
];
