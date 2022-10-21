/**
 * Data source utilities
 */
import { DataSource } from '@arql/models';

export class UnresolveableSource extends DataSource {
  supportsExpressionFields = false;
  supportsExpressions = false;
  supportsFieldAliasing = false;
  supportsGraphFields = false;
  supportsQueryNarrowing = false;
  supportsRecursiveJoins = false;
  supportsShaping = false;
  supportsStaticDataInjection = false;
  supportsSubCollections = false;
  supportsSubExpressions = false;
  supportsSubscriptions = false;
  supportsParameters = false;
  subCollectionDepth = 0;
  async resolve() {
    return [];
  }
}
export const Unresolveable = new UnresolveableSource([], {}, {});
