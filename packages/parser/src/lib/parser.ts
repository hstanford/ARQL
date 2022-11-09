import { Parser } from 'arcsecond';
import { alias } from './alias.js';
import { alphachain, dotSequence } from './alphachain.js';
import {
  collection,
  collectionlist,
  collectionWithShape,
  collectionWithTransforms,
} from './collection.js';
import { expr, exprlist, exprNoOp, exprOp } from './expr.js';
import { field, fieldList } from './field.js';
import { keyword } from './keyword.js';
import { opchar } from './op.js';
import { param } from './param.js';
import { query } from './query.js';
import { shape } from './shape.js';
import {
  transform,
  transformArg,
  transformArgs,
  transforms,
} from './transform.js';

export class MultiCollection extends Map {}

const parsers = {
  keyword,
  dotSequence,
  alphachain,
  alias,
  param,
  opchar,
  exprNoOp,
  exprOp,
  expr,
  exprlist,
  transformArg,
  transformArgs,
  transform,
  transforms,
  collection,
  collectionWithTransforms,
  collectionWithShape,
  collectionlist,
  field,
  fieldList,
  shape,
  query,
};

export function parse<T extends keyof typeof parsers = 'query'>(
  str: string,
  parserName?: T
) {
  type extractGeneric<Type> = Type extends Parser<infer X> ? X : never;
  type S = extractGeneric<typeof parsers[T]>;
  const out = parsers[parserName || 'query'].run(str);
  if (out.isError === true) throw new Error(out.error);
  else return out.result as S;
}
