import {
  array,
  dataTypes,
  FunctionDef,
  generic,
  tuple,
  unknown,
  UnknownType,
} from '@arql/types';

export const functions: FunctionDef[] = [
  {
    // an aggregate function, passed a field name
    // get the maximum value of a field over a set of rows
    // e.g. test | group(foo) { foo, bar: max(bar) }
    name: 'max',
    signature: {
      args: tuple(dataTypes.number),
      return: dataTypes.number,
    },
  },
  {
    // an aggregate function, passed a field name
    // get the minimum value of a field over a set of rows
    // e.g. test | group(foo) { foo, bar: min(bar) }
    name: 'min',
    signature: {
      args: tuple(dataTypes.number),
      return: dataTypes.number,
    },
  },
  {
    // an aggregate function, passed a field name
    // get the total number of records for this field
    // e.g. test | group(foo) { foo, nBar: count.distinct(bar) }
    name: 'count',
    signature: {
      args: tuple(new UnknownType({})),
      return: dataTypes.number,
    },
    modifiers: ['distinct'], // if "distinct" only count unique values
  },
  {
    // an aggregate function, passed a field name
    // get an array aggregation of all the values
    // e.g. test | group(foo) { foo, bar: array(bar) }
    name: 'array',
    signature: (genericValues) => ({
      args: tuple(generic('T', genericValues)),
      return: array(generic('T', genericValues)),
    }),
  },
  {
    name: 'equals',
    signature: {
      args: tuple(unknown, unknown),
      return: dataTypes.boolean,
    },
  },
  {
    name: 'add',
    signature: (genericValues) => ({
      args: tuple(generic('T', genericValues), generic('T', genericValues)),
      return: generic('T', genericValues),
    }),
  },
];
