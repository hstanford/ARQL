import {
  char,
  choice,
  many,
  optionalWhitespace,
  Parser,
  possibly,
  recursiveParser,
  sequenceOf,
} from 'arcsecond';
import { alias } from './alias';
import { alphachain, Alphachain } from './alphachain';
import { multiShape, shape, Shape } from './shape';
import { possiblyTransforms, Transform, transforms } from './transform';

export interface Collection {
  type: 'collection';
  alias: string | undefined;
  value: Alphachain | Collection[] | Collection | null;
  transforms: Transform[];
  shape: Shape | Shape[] | null;
}

// a collection corresponds to another collection or data model providing
// the incoming data, 0 or more transforms, and then finally an
// optional "shape"
export const collection: Parser<Collection, string, any> = recursiveParser(() =>
  sequenceOf([
    possibly(alias),
    optionalWhitespace,
    choice([collectionlist, alphachain]),
    optionalWhitespace,
    possiblyTransforms,
    possibly(shape),
  ]).map((parts) => ({
    type: 'collection',
    alias:
      parts[0] ||
      (typeof parts[2] === 'string' && parts[2]) ||
      (!Array.isArray(parts[2]) &&
        parts[2].type === 'alphachain' &&
        [parts[2].root, ...parts[2].parts].pop()) ||
      undefined,
    value: parts[2],
    transforms: parts[4],
    shape: parts[5],
  }))
);

export const collectionWithTransforms: Parser<Collection, string, any> =
  recursiveParser(() =>
    sequenceOf([
      possibly(alias),
      optionalWhitespace,
      choice([collectionlist, alphachain]),
      optionalWhitespace,
      transforms,
      possibly(shape),
    ]).map((parts) => ({
      type: 'collection',
      alias:
        parts[0] ||
        (typeof parts[2] === 'string' && parts[2]) ||
        (!Array.isArray(parts[2]) &&
          parts[2].type === 'alphachain' &&
          [parts[2].root, ...parts[2].parts].pop()) ||
        undefined,
      value: parts[2],
      transforms: parts[4],
      shape: parts[5],
    }))
  );

export const collectionWithShape: Parser<Collection, string, any> =
  recursiveParser(() =>
    sequenceOf([
      possibly(alias),
      optionalWhitespace,
      possibly(choice([collectionlist, alphachain])),
      optionalWhitespace,
      possiblyTransforms,
      choice([shape, multiShape]),
    ]).map((parts) => ({
      type: 'collection',
      alias:
        parts[0] ||
        (typeof parts[2] === 'string' && parts[2]) ||
        (!Array.isArray(parts[2]) &&
          parts[2]?.type === 'alphachain' &&
          [parts[2].root, ...parts[2].parts].pop()) ||
        undefined,
      value: parts[2],
      transforms: parts[4],
      shape: parts[5],
    }))
  );

// when you want to combine data from different collections, you can collect
// them in parentheses as a collectionlist before applying a transform to combine
// e.g. ( users, orders ) | join(users.id = orders.userId)
export const collectionlist: Parser<Collection | Collection[], string, any> =
  sequenceOf([
    char('('),
    optionalWhitespace,
    collection,
    optionalWhitespace,
    many(
      sequenceOf([
        char(','),
        optionalWhitespace,
        collection,
        optionalWhitespace,
      ]).map((parts) => parts[2])
    ),
    possibly(char(',')),
    optionalWhitespace,
    char(')'),
  ]).map((parts) => {
    return parts[4].length ? [parts[2]].concat(parts[4]) : parts[2];
  });
