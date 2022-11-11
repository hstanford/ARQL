import { MongoDb } from '@arql/source-mongodb';
import { transforms, functions } from '@arql/stdlib-mongodb';

export async function createMongoSource(connectionUri: string, db: string) {
  const source = new MongoDb({
    models: [],
    transforms,
    functions,
    connectionUri,
    db,
  });
  await source.init();
  return source;
}
