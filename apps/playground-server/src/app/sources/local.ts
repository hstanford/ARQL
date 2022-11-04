import { JsSource, Row } from '@arql/source-js';
import { functions, operators, transforms } from '@arql/stdlib-js';

export async function createLocalSource(data: Map<string, Row[]>) {
  const source = new JsSource({
    models: [],
    data,
    functions,
    operators,
    transforms,
  });

  await source.init();
  return source;
}
