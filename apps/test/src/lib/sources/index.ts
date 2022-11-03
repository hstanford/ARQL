import { DataModel } from '@arql/models';
import { localTestSource } from './local';
import { pgTestSource } from './postgresql';

export const sources = [localTestSource, pgTestSource];
export const models = sources.reduce(
  (acc, source) => acc.concat(source.models),
  [] as DataModel[]
);
