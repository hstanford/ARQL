import { FunctionDef, TransformDef } from '@arql/types';
import { uniq } from '@arql/util';
import { combineFlags, Flags } from './flags';
import { DataSource } from './source';

// a set of stipulations attached to a node that must be met
// by a source in order to resolve data from that source at that node
export interface Requirements {
  sources: DataSource[];
  flags: Partial<Flags>;
  functions: FunctionDef[];
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
