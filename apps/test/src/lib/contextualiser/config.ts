import { models } from '../data';
import { functions } from './functions';
import { opMap } from './operators';
import { transforms } from './transforms';

export const contextualiserConfig = {
  models: new Map(models.map((m) => [m.name, m])),
  transforms,
  functions,
  opMap,
};
