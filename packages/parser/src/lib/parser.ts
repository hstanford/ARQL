/**
 * PARSER
 *
 * The Parser's role is to take a string and construct an AST (Abstract Syntax Tree)
 * which is independent of the models configured. It is "what is the user trying to
 * ask for" without knowing what can be provided.
 *
 * It is dependent on an "opResolver" function, which is used to transform a flat
 * expression into a tree. This function should know what symbols correspond to which
 * operations, and know the overall operator precedence. Except for modifications
 * "-+", "-x" and "->", all operators are configurable.
 */

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
