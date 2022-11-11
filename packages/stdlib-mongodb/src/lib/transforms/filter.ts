import { TransformFn } from '@arql/source-mongodb';

export const filter: TransformFn = (transform, query, args) => {
  query.query.push({ $match: { $expr: args[0] } });
};
