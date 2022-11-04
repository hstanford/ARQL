import { PostgreSQL } from '@arql/source-postgresql';
import { operators, transforms, functions } from '@arql/stdlib-postgresql';

export async function createPgSource(
  connectionVariables: Record<string, unknown>
) {
  const source = new PostgreSQL({
    models: [],
    operators,
    transforms,
    functions,
    connectionVariables,
  });
  await source.init();
  return source;
}
