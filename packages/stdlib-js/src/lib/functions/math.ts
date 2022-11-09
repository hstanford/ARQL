import { FunctionFn } from '@arql/source-js';
import { FuncDef } from '@arql/stdlib-definitions';
import { PrimitiveType, TupleType, UnionType } from '@arql/types';

type StrArgs = TupleType<[PrimitiveType<'string'>, PrimitiveType<'string'>]>;
type NumArgs = TupleType<[PrimitiveType<'number'>, PrimitiveType<'number'>]>;
type AddSignature = FunctionFn<{
  args: UnionType<[StrArgs, NumArgs]>;
  return: UnionType<[PrimitiveType<'string'>, PrimitiveType<'number'>]>;
}>;
export const add: AddSignature = ([left, right]) => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left + right;
  } else {
    throw new Error('Could not sum values');
  }
};

type MinusSignature = FunctionFn<FuncDef<'minus'>['signature']>;
export const minus: MinusSignature = ([left, right]) => {
  return left - right;
};
