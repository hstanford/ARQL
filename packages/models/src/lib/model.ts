import { DataField, DataFieldDef } from './field';
import { Node } from './node';
import { Requirements } from './requirements';
import { DataSource } from './source';

// the configuration that can be used to instantiate a new data model
export interface DataModelDef {
  name: string;
  fields: readonly DataFieldDef[];
}

// a collection of fields that is accessible in a particular source
// the equivalent to a "table" in a relational database
export class DataModel extends Node<DataModelDef> {
  constructor(opts: DataModelDef, source: DataSource) {
    super();
    this.name = opts.name;
    this.fields = opts.fields.map((f) => new DataField(f, this));
    this.source = source;
  }

  name: string;

  // the source where you can access this model's data
  source: DataSource;

  fields: DataField[];

  get availableFields(): DataField[] {
    return this.fields;
  }

  get requiredFields(): DataField[] {
    // a Data model doesn't put any requirements out
    return [];
  }

  /** serialisation getter for testing */
  get def(): DataModelDef {
    return {
      name: this.name,
      fields: this.fields.map((f) => f.def),
    };
  }

  get requirements(): Requirements {
    return {
      ...this._requirements,
      sources: this._requirements.sources.concat(this.source),
    };
  }
}
