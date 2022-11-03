import {
  ContextualisedCollection,
  ContextualisedField,
  ContextualisedTransform,
  ID,
} from '@arql/contextualiser';
import { Query } from 'sql-ts';
import { buildCollection } from './collection';
import { SourceContext } from './context';
import { buildField, buildFieldValue } from './field';
import { Column, SubQuery } from './types';

export function applyShape(
  subQuery: SubQuery,
  name: string,
  shape: ContextualisedField[],
  constituentFields: Record<ID, Column>,
  context: SourceContext
) {
  return subQuery.table
    .subQuery(name)
    .select(...shape.map((f) => buildField(f, constituentFields, context)))
    .from(subQuery) as SubQuery;
}

// build a sql query for a transform
export function buildTransform(
  transform: ContextualisedTransform,
  context: SourceContext
): SubQuery {
  const transformFn = context.transforms[transform.transform.name];
  if (!transformFn) {
    throw new Error(`Could not find transform ${transform.transform.name}`);
  }

  const origins: SubQuery[] = [];
  const constituentFields: Record<ID, Column> = {};

  // build queries for all origins, and keep track of the fields they expose (consistuentFields)
  for (const orig of [transform.origin].flat()) {
    let origin: SubQuery;
    if (orig instanceof ContextualisedCollection) {
      origin = buildCollection(orig, context) as SubQuery;
    } else if (orig instanceof ContextualisedTransform) {
      origin = buildTransform(orig, context);
    } else {
      throw new Error('Unrecognised transform origin');
    }

    for (const rf of orig.requiredFields) {
      const col = origin.columns.find((c) => (c.alias ?? c.name) === rf.name);
      if (!col) {
        throw new Error(`Could not find column ${rf.name}`);
      }
      constituentFields[rf.id] = col;
    }

    origins.push(origin);
  }

  // apply the transformation functions to the origin queries
  const out = transformFn(
    transform.name,
    transform.modifier,
    origins,
    transform.args.map((arg) =>
      buildFieldValue(arg, constituentFields, context)
    ),
    transform.shape,
    constituentFields,
    context
  );

  if (!(out instanceof Query)) {
    throw new Error(
      'Expected a query - perhaps a failed multi-origin transform'
    );
  }

  return out;
}
