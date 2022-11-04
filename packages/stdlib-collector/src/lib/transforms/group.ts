import { ContextualisedField, isId } from '@arql/contextualiser';
import { applyShape, resolveArgs, Row, TransformFn } from '@arql/collector';

export const group: TransformFn = (
  transform,
  origin,
  constituentFields,
  context
) => {
  if (!Array.isArray(origin)) {
    throw new Error('Grouping multi-origin is not supported');
  }

  // get field names that we are grouping by
  const fieldKeys = transform.args
    .filter(isId)
    .map((id) => constituentFields.find((f) => f.id === id))
    .filter(
      (f: ContextualisedField | undefined): f is ContextualisedField => !!f
    )
    .map((f) => f.name);

  // aggregate rows with bucket keys as the transform arguments
  const lookup = new Map<string, Row[]>();
  for (const record of origin) {
    const key = JSON.stringify(
      resolveArgs(transform, record, constituentFields, context)
    );
    if (!lookup.has(key)) {
      lookup.set(key, [record]);
    } else {
      lookup.get(key)?.push(record);
    }
  }

  // convert the aggregate {key: row[]} to {fieldKey: value, nonFieldKey: value[]}[]
  // default aggregation method is array aggregation
  let out: Row[] = [];
  for (const [, value] of lookup.entries()) {
    const grouped: Row = {};
    for (const key in value[0]) {
      if (fieldKeys.includes(key)) {
        grouped[key] = value[0][key];
      } else {
        grouped[key] = value.map((v) => v[key]);
      }
    }

    out.push(grouped);
  }

  // reshape if applicable
  if (transform.shape) {
    out = applyShape(transform.shape, out, constituentFields, context);
  }

  return out;
};
