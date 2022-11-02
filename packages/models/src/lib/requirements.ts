import { uniq } from '@arql/util';
import { combineFlags, Flags } from './flags';
import { DataSource } from './source';

/**
 * "TransformDef" is a data structure that details the call signature of
 * a transformation function
 */
export interface TransformDef {
  name: string;
  // flags to customise the behaviour of the transformation
  modifiers?: string[];
  // number of arguments the transform accepts (can be variadic using "+")
  nArgs: string | number; // e.g. `1`, `0+` etc
}

// a set of stipulations attached to a node that must be met
// by a source in order to resolve data from that source at that node
export interface Requirements {
  sources: DataSource[];
  flags: Partial<Flags>;
  functions: TransformDef[];
  transforms: TransformDef[];
  operations: string[];
}

// combines multiple requirements to ensure that
// anything that does not satisfy one of the input requirements
// does not satisfy the output requirement
export function combineRequirements(...requirements: Requirements[]) {
  const baseRequirement: Requirements = {
    sources: [],
    flags: {},
    functions: [],
    transforms: [],
    operations: [],
  };
  for (const requirement of requirements) {
    baseRequirement.sources = uniq(
      baseRequirement.sources.concat(requirement.sources)
    );
    baseRequirement.flags = combineFlags(
      baseRequirement.flags,
      requirement.flags
    );
    baseRequirement.functions = uniq(
      baseRequirement.functions.concat(requirement.functions)
    );
    baseRequirement.transforms = uniq(
      baseRequirement.transforms.concat(requirement.transforms)
    );
    baseRequirement.operations = uniq(
      baseRequirement.operations.concat(requirement.operations)
    );
  }
  return baseRequirement;
}
