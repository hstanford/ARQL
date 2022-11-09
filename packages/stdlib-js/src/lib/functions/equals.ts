import { FunctionFn } from '@arql/collector';
import { FuncDef } from '@arql/stdlib-definitions';

type EqualsSignature = FunctionFn<FuncDef<'equals'>['signature']>;
export const equals: EqualsSignature = ([left, right]) => {
  return left === right;
};

type notEqualsSignature = FunctionFn<FuncDef<'notEquals'>['signature']>;
export const notEquals: notEqualsSignature = ([left, right]) => {
  return left !== right;
};
