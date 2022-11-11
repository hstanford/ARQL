import { FunctionFn } from '@arql/source-mongodb';

export const equals: FunctionFn = (args) => {
  return { $eq: args };
};

export const notEquals: FunctionFn = (args) => {
  return { $ne: args };
};
