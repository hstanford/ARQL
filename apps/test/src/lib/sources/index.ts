import { localTestSource } from './local.js';
import { mongoTestSource } from './mongo.js';
import { pgTestSource } from './postgresql.js';

export const sources = [localTestSource, pgTestSource, mongoTestSource];
