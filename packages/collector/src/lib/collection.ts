import { ContextualisedField } from '@arql/contextualiser';
import {
  DelegatedCollection,
  DelegatedResults,
  DelegatedTransform,
} from '@arql/delegator';
import { DataModel } from '@arql/models';
import { CollectorContext, isResultMaps, Records, Row } from './context';
import { buildFieldValue } from './field';
import { collectTransform } from './transform';

// transform a set of results ("records") whose interface should
// match "constituentFields" into the interface matching "shape"
export function applyShape(
  shape: ContextualisedField[],
  records: Records,
  constituentFields: ContextualisedField[],
  context: CollectorContext
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
export async function collectCollection(
  collection: DelegatedCollection,
  queryResults: Record<string, unknown>[][],
  context: CollectorContext
): Promise<Row[]> {
  // the expected interface of the data exposed by the collection's origin
  let constituentFields: ContextualisedField[];

  // the data resolved by the collection
  let out: Records;

  // resolve the collection's origin
  if (collection.origin instanceof DataModel) {
    throw new Error('DataModel must be resolved by a source');
  } else if (collection.origin instanceof DelegatedResults) {
    out = queryResults[collection.origin.index];
    constituentFields = collection.origin.fields;
  } else if (collection.origin instanceof DelegatedCollection) {
    out = await collectCollection(collection.origin, queryResults, context);
    constituentFields = collection.origin.availableFields;
  } else if (collection.origin instanceof DelegatedTransform) {
    out = await collectTransform(collection.origin, queryResults, context);
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
