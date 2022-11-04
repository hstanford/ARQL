// eslint-disable-next-line
// @ts-nocheck
export abstract class Flags {
  // these will be used by the contextualiser/delegator to work out if
  // we need to reject the query or where to break the node off the tree
  // as a delegated query we can definitely resolve
  abstract supportsExpressions: boolean;
  abstract supportsSubExpressions: boolean;

  /**
   * the maximum depth of nested collections that the source can query.
   * "1" implies that the query tree handed off to the delegator must
   * have at most one contextualised query.
   * "undefined" indicates no limit to the depth
   */
  abstract subCollectionDepth: number;

  abstract supportsShaping: boolean;
  abstract supportsFieldAliasing: boolean;
  abstract supportsExpressionFields: boolean;
  abstract supportsGraphFields: boolean; // like users {orders {name}}
  abstract supportsRecursiveJoins: boolean;
  abstract supportsStaticDataInjection: boolean; // like VALUES
  abstract supportsQueryNarrowing: boolean; // id IN (...) type operations
  abstract supportsSubscriptions: boolean;
  abstract supportsParameters: boolean;
}

// combines multiple Flags instances to ensure that
// anything that does not satisfy one of the input Flags
// does not satisfy the output Flags
export function combineFlags(...flags: Partial<Flags>[]) {
  const outFlags: Partial<Flags> = {};
  for (const flagSet of flags) {
    for (const key in flagSet) {
      const castKey = key as keyof Flags;
      const val = flagSet[castKey];
      if (typeof val === 'boolean') {
        // TODO: find a nice way of doing this without "any" casts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        outFlags[castKey] = !!(flagSet[castKey] || outFlags[castKey]) as any;
      } else if (typeof val === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        outFlags[castKey] = (val + ((outFlags[castKey] as number) ?? 0)) as any;
      } else {
        throw new Error(`Unexpected flag value ${typeof val}`);
      }
    }
  }
  return outFlags;
}
