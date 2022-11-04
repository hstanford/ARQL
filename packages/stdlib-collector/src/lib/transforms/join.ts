import {
  applyShape,
  Records,
  resolveArgs,
  ResultMap,
  TransformFn,
} from '@arql/collector';

function* getPermutation(
  entries: [string, Records][]
): Generator<ResultMap, void, unknown> {
  if (entries.length < 1) throw new Error('No entries!');
  const [name, records] = entries[0];
  if (entries.length === 1) {
    for (const record of records) {
      if (record instanceof Map) {
        throw new Error(
          'Unexpected ResultMap - apply shape before combining further'
        );
      }
      yield new Map([[name, record]]);
    }
  } else {
    for (const record of records) {
      for (const subPermutation of getPermutation(entries.slice(1))) {
        if (record instanceof Map) {
          throw new Error(
            'Unexpected ResultMap - apply shape before combining further'
          );
        }
        subPermutation.set(name, record);
        yield subPermutation;
      }
    }
  }
}

export const join: TransformFn = (
  transform,
  origin,
  constituentFields,
  context
) => {
  if (Array.isArray(origin)) {
    throw new Error('Multiple origins expected');
  }

  const out: ResultMap[] = [];

  // inner join
  const entries = Object.entries(origin);
  for (const entry of getPermutation(entries)) {
    const [matches] = resolveArgs(transform, entry, constituentFields, context);
    if (matches) {
      out.push(entry);
    }
  }

  // TODO: left, right, outer etc joins

  if (transform.shape) {
    return applyShape(transform.shape, out, constituentFields, context);
  }
  return out;
};
