import { FunctionFn } from '@arql/collector';
import { FuncDef } from '@arql/stdlib-definitions';
import { PrimitiveType, TupleType, UnionType } from '@arql/types';

// generics here should eventually be worked out from the input
type StrArgs = TupleType<[PrimitiveType<'string'>, PrimitiveType<'string'>]>;
type NumArgs = TupleType<[PrimitiveType<'number'>, PrimitiveType<'number'>]>;
type AddSignature = FunctionFn<{
  args: UnionType<[StrArgs, NumArgs]>;
  return: UnionType<[PrimitiveType<'string'>, PrimitiveType<'number'>]>;
}>;

// also it's not doing a discriminated union of tuple types right 🤔
// turns out https://github.com/microsoft/TypeScript/issues/31613 is the problem
export const add: AddSignature = ([left, right]) => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left + right;
  } else if (typeof left === 'string' && typeof right === 'string') {
    return left + right;
  } else {
    throw new Error('Could not sum values');
  }
};

// would like to do this more concisely, but "signature"
// accessing has to happen outside the generic
type MinusSignature = FunctionFn<FuncDef<'minus'>['signature']>;
export const minus: MinusSignature = ([left, right]) => {
  return left - right;
};
