import { ContextualisedField } from '@arql/contextualiser';
import {
  DelegatedCollection,
  DelegatedResults,
  DelegatedTransform,
  DelegatedTransformOrigin,
  DelegatedTransformOrigins,
  isMultiOrigin,
} from '@arql/delegator';
import { collectCollection } from './collection';
import { CollectorContext, Row, ResultMap, Records } from './context';
import { buildFieldValue } from './field';

type OriginValue<T> = T extends DelegatedTransformOrigin[]
  ? Record<string, Records>
  : Row[];

type OriginResult<T> = {
  origin: OriginValue<T>;
  constituentFields: ContextualisedField[];
};

// resolve the data of the origin(s) of a transform and the
// fields that are exposed by that data
async function getOrigins<T extends DelegatedTransformOrigins>(
  origin: T,
  queryResults: Record<string, unknown>[][],
  context: CollectorContext
): Promise<OriginResult<T>> {
  // fields exposed by the origin(s)
  const constituentFields: ContextualisedField[] = [];

  // resolve the data of a single origin and capture its exposed fields
  async function transformOrigin(
    origin: DelegatedCollection | DelegatedTransform | DelegatedResults
  ) {
    let out: Records = [];
    if (origin instanceof DelegatedResults) {
      out = queryResults[origin.index];
      constituentFields.push(...origin.fields);
    } else if (origin instanceof DelegatedCollection) {
      out = await collectCollection(origin, queryResults, context);
      constituentFields.push(...origin.availableFields);
    } else if (origin instanceof DelegatedTransform) {
      out = await collectTransform(origin, queryResults, context);
      constituentFields.push(...origin.availableFields);
    } else {
      throw new Error('Unsupported collection origin');
    }
    return out;
  }

  // resolve all the origins
  let origins: Record<string, Records> | Records | undefined = undefined;
  if (isMultiOrigin(origin)) {
    origins = {};
    for (const singleOrigin of origin) {
      // we need a name in order to build the origins map
      if (!singleOrigin.name) {
        throw new Error('Expected name for origin');
      }

      origins[singleOrigin.name] = await transformOrigin(singleOrigin);
    }
  } else {
    origins = await transformOrigin(origin);
  }

  return {
    // cast is necessary in order to preserve expected signature
    origin: origins as OriginValue<T>,
    constituentFields,
  };
}

// resolve and transform the data this transform node represents
export async function collectTransform(
  transform: DelegatedTransform,
  queryResults: Record<string, unknown>[][],
  context: CollectorContext
): Promise<Records> {
  // resolve the data of the origin(s)
  const { origin, constituentFields } = await getOrigins(
    transform.origin,
    queryResults,
    context
  );

  // assert the specified transformation function is configured
  const transformFn = context.transforms[transform.name];
  if (!transformFn) {
    throw new Error(`Missing transform implementation for ${transform.name}`);
  }

  // function to resolve arguments from any particular record
  const argsFn = (record: Row | ResultMap) =>
    transform.args.map((arg) =>
      buildFieldValue(arg, record, constituentFields, context)
    );

  // run the transform over the data
  return transformFn(
    transform.modifier,
    origin,
    argsFn,
    constituentFields,
    context,
    transform.shape
  );
}
