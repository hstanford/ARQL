import {
  ContextualisedCollection,
  ContextualisedField,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel } from '@arql/models';
import { SourceContext, isResultMaps, Records, Row } from './context.js';
import { buildFieldValue } from './field.js';
import { resolveTransform } from './transform.js';

// transform a set of results ("records") whose interface should
// match "constituentFields" into the interface matching "shape"
export function applyShape(
  shape: ContextualisedField[],
  records: Records,
  constituentFields: ContextualisedField[],
  context: SourceContext
) {
  // TODO: this is likely to be _really_ slow - the fact
  // that "records" is homogeneous should be leveraged
  return records.map((record) =>
    shape.reduce((acc, item) => {
      acc[item.name] = buildFieldValue(
        item.field,
        record,
        constituentFields,
        context
      );
      return acc;
    }, {} as Record<string, unknown>)
  );
}

// resolve a collection into the data it represents
export async function resolveCollection(
  collection: ContextualisedCollection,
  context: SourceContext
): Promise<Row[]> {
  // the expected interface of the data exposed by the collection's origin
  let constituentFields: ContextualisedField[];

  // the data resolved by the collection
  let out: Records;

  // resolve the collection's origin
  if (collection.origin instanceof DataModel) {
    const modelData = context.data.get(collection.origin.name);
    if (!modelData) {
      throw new Error(
        `Could not find data for model ${collection.origin.name}`
      );
    }

    out = modelData;

    // DataModel's fields are exposed directly in the enclosing collection
    constituentFields = [];
  } else if (collection.origin instanceof ContextualisedCollection) {
    out = await resolveCollection(collection.origin, context);
    constituentFields = collection.origin.availableFields;
  } else if (collection.origin instanceof ContextualisedTransform) {
    out = await resolveTransform(collection.origin, context);
    constituentFields = collection.origin.availableFields;
  } else {
    throw new Error('Unsupported collection origin');
  }

  // transform the interface of the collection if necessary
  if (collection.shape) {
    out = applyShape(collection.shape, out, constituentFields, context);
  }

  // an intermediate "multi-collection" should be shaped before
  // the collection resolves it
  if (isResultMaps(out)) {
    throw new Error('Cannot produce result maps from collection');
  }

  return out;
}
