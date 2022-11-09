import {
  array,
  dataTypes,
  FunctionDef,
  generic,
  tuple,
  union,
  unknown,
  UnknownType,
} from '@arql/types';
import { assertType } from '@arql/util';

export const functions = assertType<readonly FunctionDef[]>()([
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
    name: 'notEquals',
    signature: {
      args: tuple(unknown, unknown),
      return: dataTypes.boolean,
    },
  },
  {
    name: 'add',
    signature: (genericValues) => ({
      args: tuple(
        generic('T', genericValues, union(dataTypes.string, dataTypes.number)),
        generic('T', genericValues, union(dataTypes.string, dataTypes.number))
      ),
      return: generic('T', genericValues),
    }),
  },
  {
    name: 'minus',
    signature: {
      args: tuple(dataTypes.number, dataTypes.number),
      return: dataTypes.number,
    },
  },
  {
    name: 'and',
    signature: {
      args: tuple(dataTypes.boolean, dataTypes.boolean),
      return: dataTypes.boolean,
    },
  },
  {
    name: 'or',
    signature: {
      args: tuple(dataTypes.boolean, dataTypes.boolean),
      return: dataTypes.boolean,
    },
  },
] as const);

export type FuncDef<T extends typeof functions[number]['name']> =
  typeof functions[number] & {
    name: T;
  };
