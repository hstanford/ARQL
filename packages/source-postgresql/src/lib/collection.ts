import {
  ContextualisedCollection,
  ContextualisedTransform,
} from '@arql/contextualiser';
import { DataModel } from '@arql/models';
import { SourceContext } from './context.js';
import { buildField } from './field.js';
import { buildTransform } from './transform.js';
import { Column, Query, SubQuery } from './types.js';

// build a sql query for a collection
export function buildCollection(
  collection: ContextualisedCollection,
  context: SourceContext
): SubQuery {
  let subQuery: Query | SubQuery;

  // if the collection's origin is a DataModel, then
  // select directly from the underlying table the model refers to
  // otherwise recurse down the tree
  if (collection.origin instanceof DataModel) {
    const model = context.models[collection.origin.name];
    if (!model) {
      throw new Error(`Could not access model ${collection.origin.name}`);
    }

    return model
      .subQuery(collection.name)
      .select(
        ...collection.requiredFields.map((rf) => buildField(rf, {}, context))
      );
  } else if (collection.origin instanceof ContextualisedCollection) {
    subQuery = buildCollection(collection.origin, context);
  } else if (collection.origin instanceof ContextualisedTransform) {
    subQuery = buildTransform(collection.origin, context);
  } else {
    throw new Error('Could not resolve collection origin');
  }

  if (!('columns' in subQuery)) {
    throw new Error('Expected subquery from nested collections');
  }

  const columns = subQuery.columns;

  // match up columns on the collection's origin to the fields available on the subquery
  const constituentFields = collection.origin.requiredFields.reduce(
    (acc, rf) => {
      if (!rf.name) {
        throw new Error(`Column should be named - perhaps needs aliasing`);
      }
      const col = columns.find((c) => (c.alias ?? c.name) === rf.name);
      if (!col) {
        throw new Error(`Could not find column ${rf.name}`);
      }

      acc[rf.id] = col;
      return acc;
    },
    {} as Record<number, Column>
  );

  // select the required fields from the underlying subQuery
  return subQuery.table
    .subQuery(collection.name)
    .select(
      ...collection.requiredFields.map((rf) =>
        buildField(rf, constituentFields, context)
      )
    )
    .from(subQuery);
}
