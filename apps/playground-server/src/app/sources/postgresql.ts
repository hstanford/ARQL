import { PostgreSQL } from '@arql/source-postgresql';
import { transforms, functions } from '@arql/stdlib-postgresql';

export async function createPgSource(
  connectionVariables: Record<string, unknown>
) {
  const source = new PostgreSQL({
    models: [],
    transforms,
    functions,
    connectionVariables,
  });
  await source.init();
  return source;
}
