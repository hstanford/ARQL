import { FunctionFn } from '@arql/source-mongodb';

export const or: FunctionFn = (args) => {
  return { $or: args };
};

export const and: FunctionFn = (args) => {
  return { $and: args };
};
