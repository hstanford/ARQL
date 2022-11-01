import {
  ContextualisedCollection,
  ContextualisedTransform,
  ID,
} from '@arql/contextualiser';
import { DataModel } from '@arql/models';
import { SourceContext } from './context';
import { buildField } from './field';
import { buildTransform } from './transform';
import { Column, Query, SubQuery } from './types';

export function buildQuery(
  collection: ContextualisedCollection,
  context: SourceContext
) {
  let subQuery: Query | SubQuery;
  if (collection.origin instanceof DataModel) {
    const model = context.models[collection.origin.name];
    if (!model) {
      throw new Error(`Could not access model ${collection.origin.name}`);
    }
    const queryBase = model.subQuery(collection.name);
    return queryBase.select(
      ...collection.requiredFields.map((rf) => buildField(rf, {}, context))
    );
  } else if (collection.origin instanceof ContextualisedCollection) {
    subQuery = buildQuery(collection.origin, context) as Query | SubQuery;
  } else if (collection.origin instanceof ContextualisedTransform) {
    subQuery = buildTransform(collection.origin, context);
  } else {
    throw new Error('Could not resolve collection origin');
  }

  if (!('columns' in subQuery)) {
    throw new Error('Expected subquery from nested collections');
  }

  const columns = subQuery.columns;

  const constituentFields = collection.origin.requiredFields.reduce(
    (acc, rf) => {
      const col = columns.find((c) => (c.alias ?? c.name) === rf.name);
      if (!col) {
        throw new Error(`Could not find column ${rf.name}`);
      }
      acc[rf.id] = col;
      return acc;
    },
    {} as Record<ID, Column>
  );

  return subQuery.table
    .subQuery(collection.name)
    .select(
      ...collection.requiredFields.map((rf) =>
        buildField(rf, constituentFields, context)
      )
    )
    .from(subQuery);
}
