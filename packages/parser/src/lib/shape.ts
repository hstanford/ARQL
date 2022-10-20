import {
  char,
  optionalWhitespace,
  Parser,
  possibly,
  sepBy,
  sequenceOf,
} from 'arcsecond';
import { Field, fieldList } from './field';
import { Wildcard } from './wildcard';

export interface Shape {
  type: 'shape';
  fields: (Field | Wildcard)[];
}

// the shape is effectively a very powerful transform function. You specify the
// structure of the data you want out of the collection in json-like syntax. If you
// want graphical data access you can use the shape for this e.g.
// users {                                                 [{
//   userId: users.id,                                ->     "userId": 1,
//   orders | filter(users.id = orders.userId) {id}   ->     "orders": [{"id": 2}]
// }                                                       }]
export const shape: Parser<Shape, string, any> = sequenceOf([
  char('{'),
  optionalWhitespace,
  fieldList,
  optionalWhitespace,
  char('}'),
]).map((parts) => ({
  type: 'shape',
  fields: parts[2],
}));

// when selecting static data it's often useful to express many shapes
// between [] in an array-like syntax. e.g. [{id: $1}, {id: $2}]
export const multiShape: Parser<Shape[], string, any> = sequenceOf([
  char('['),
  optionalWhitespace,
  sepBy(sequenceOf([optionalWhitespace, char(','), optionalWhitespace]))(
    possibly(shape)
  ),
  optionalWhitespace,
  char(']'),
]).map((parts) => parts[2].filter((i) => !!i) as Shape[]);
