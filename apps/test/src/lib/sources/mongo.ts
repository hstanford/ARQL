import { MongoDb } from '@arql/source-mongodb';
import { transforms, functions } from '@arql/stdlib-mongodb';

export const mongoTestSource = new MongoDb({
  models: [],
  transforms,
  functions,
  connectionUri: 'mongodb://root:example@localhost:27017/',
  db: 'test',
});
