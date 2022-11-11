import { FunctionFn } from '@arql/source-mongodb';

export const add: FunctionFn = (args) => {
  return { $add: args };
};

export const minus: FunctionFn = (args) => {
  return { $subtract: args };
};
