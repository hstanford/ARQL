import { DataModel } from '@arql/models';
import { localTestSource } from './local/source';
import { pgTestSource } from './postgresql/source';

export const sources = [localTestSource, pgTestSource];
export const models = sources.reduce(
  (acc, source) => acc.concat(source.models),
  [] as DataModel[]
);
