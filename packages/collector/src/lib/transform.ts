import { ContextualisedField } from '@arql/contextualiser';
import {
  DelegatedCollection,
  DelegatedResults,
  DelegatedTransform,
  DelegatedTransformOrigins,
} from '@arql/delegator';
import { collectCollection } from './collection';
import { CollectorContext, ResultMap, Results } from './context';
import { buildFieldValue } from './field';

type OriginValue<T> = T extends unknown[]
  ? Record<string, Results | ResultMap[]>
  : Results;

type OriginResult<T> = {
  origin: OriginValue<T>;
  constituentFields: ContextualisedField[];
};

async function getOrigins<T extends DelegatedTransformOrigins>(
  origin: T,
  queryResults: Record<string, unknown>[][],
  context: CollectorContext
): Promise<OriginResult<T>> {
  const constituentFields: ContextualisedField[] = [];
  async function transformOrigin(
    origin: DelegatedCollection | DelegatedTransform | DelegatedResults
  ) {
    let out: Results | ResultMap[] = [];
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

  if (Array.isArray(origin)) {
    const origins: Record<string, Results | ResultMap[]> = {};
    for (const orig of origin) {
      const o: DelegatedCollection | DelegatedTransform | DelegatedResults =
        orig;
      const or = await transformOrigin(o);
      if (!o.name) {
        throw new Error('Expected name for origin');
      }
      origins[o.name] = or;
    }
    return {
      origin: origins as OriginValue<T>,
      constituentFields,
    };
  } else {
    return {
      origin: (await transformOrigin(origin)) as OriginValue<T>,
      constituentFields,
    };
  }
}

export async function collectTransform(
  transform: DelegatedTransform,
  queryResults: Record<string, unknown>[][],
  context: CollectorContext
): Promise<Results | ResultMap[]> {
  const { origin, constituentFields } = await getOrigins(
    transform.origin,
    queryResults,
    context
  );

  const transformFn = context.transforms[transform.name];

  if (!transformFn) {
    throw new Error(`Missing transform implementation for ${transform.name}`);
  }

  return transformFn(
    transform.modifier,
    origin,
    (record) =>
      transform.args.map((arg) =>
        buildFieldValue(arg, record, constituentFields, context)
      ),
    constituentFields,
    context,
    transform.shape
  );
}
