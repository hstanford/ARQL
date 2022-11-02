import { Parser } from 'arcsecond';
import { alias } from './alias';
import { alphachain, dotSequence } from './alphachain';
import {
  collection,
  collectionlist,
  collectionWithShape,
  collectionWithTransforms,
} from './collection';
import { expr, exprlist, exprNoOp, exprOp } from './expr';
import { field, fieldList } from './field';
import { keyword } from './keyword';
import { opchar } from './op';
import { param } from './param';
import { query } from './query';
import { shape } from './shape';
import {
  transform,
  transformArg,
  transformArgs,
  transforms,
} from './transform';

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
