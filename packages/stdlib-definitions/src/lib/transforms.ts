import { array, dataTypes, TransformDef, UnknownType } from '@arql/types';
import { assertType } from '@arql/util';

export const transforms = assertType<readonly TransformDef[]>()([
  {
    // a transformation that is passed a predicate
    // return a subset of rows that satisfy the predicate
    // e.g. test | filter(foo = $1)
    name: 'filter',
    signature: {
      args: array(dataTypes.boolean),
    },
  },
  {
    // a transformation that is passed one or more fields
    // return the rows in an order based on the value of the fields
    // e.g. test | filter(foo = $1)
    name: 'sort',
    signature: {
      args: array(new UnknownType({})),
    },
    modifiers: ['desc'],
  },
  {
    // a multi-origin transformation that is passed a predicate
    // return all sets containing a row from each origin where the set satisfies the predicate
    // e.g. (test, other) | join(test.id = other.testId)
    name: 'join',
    signature: {
      args: array(dataTypes.boolean),
    },
  },
  {
    // a transformation that is passed one or more fields
    // return a row for each unique set of values for the fields passed
    // those fields are available as-is, whereas unspecified fields must be aggregated in the output
    // e.g. test | group(foo) {max: max(foo)}
    name: 'group',
    signature: {
      args: array(new UnknownType({})),
    },
  },
] as const);
