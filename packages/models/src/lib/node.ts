import { Requirements } from './requirements.js';

// abstract syntax tree node - every node in the trees produced
// by the contextualiser/delegator should inherit from this
export abstract class Node<T = undefined> {
  _requirements: Requirements = {
    sources: [],
    flags: {},
    functions: [],
    transforms: [],
    operations: [],
  };
  abstract get requirements(): Requirements;
  constructor(opts?: T) {
    opts && Object.assign(this, opts);
  }
}
