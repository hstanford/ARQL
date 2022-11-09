import { FunctionFn } from '@arql/source-js';
import { FuncDef } from '@arql/stdlib-definitions';

type OrSignature = FunctionFn<FuncDef<'or'>['signature']>;
export const or: OrSignature = ([left, right]) => {
  return left || right;
};

type AndSignature = FunctionFn<FuncDef<'and'>['signature']>;
export const and: AndSignature = ([left, right]) => {
  return left && right;
};
