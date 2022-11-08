import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { testObjects, testModel, testSource } from './test_helpers';
import { ContextualisedParam } from './param';
import { ContextualiserState } from './util';
import { dataTypes } from '@arql/types';

const emptyConfig = {
  functions: [],
  transforms: [],
  models: new Map(),
  opMap: new Map(),
};

describe('expr', () => {
  it('can list the fields that constitute the expression with one field', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField } = testObjects(context);
    const expr = new ContextualisedExpr({
      context,
      op: 'equals',
      args: [
        fooField.id,
        new ContextualisedParam({
          index: 0,
        }),
      ],
      dataType: dataTypes.boolean,
    });

    expect(expr.constituentFields).toEqual([fooField.id]);
  });

  it('can list the fields that constitute the expression with multiple fields', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField, barField } = testObjects(context);
    const expr = new ContextualisedExpr({
      context,
      op: 'equals',
      args: [fooField.id, barField.id],
      dataType: dataTypes.boolean,
    });

    expect(expr.constituentFields).toEqual([fooField.id, barField.id]);
  });

  it('can list the fields that constitute the expression with nested fields', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField } = testObjects(context);
    const field = new ContextualisedField({
      context,
      field: fooField.id,
      name: 'foo',
      origin: new ContextualisedCollection({
        context,
        origin: testModel,
        name: 'testtest',
      }),
      dataType: dataTypes.number,
    });
    const expr = new ContextualisedExpr({
      context,
      op: 'equals',
      args: [field.id, new ContextualisedParam({ index: 0 })],
      dataType: dataTypes.boolean,
    });

    expect(expr.constituentFields).toEqual([field.id]);
  });

  it('can list the sources that constitute the expression with nested fields', () => {
    const context = new ContextualiserState(emptyConfig);
    const { fooField } = testObjects(context);
    const field = new ContextualisedField({
      context,
      field: fooField.id,
      name: 'foo',
      origin: new ContextualisedCollection({
        context,
        origin: testModel,
        name: 'testtest',
      }),
      dataType: dataTypes.boolean,
    });
    const expr = new ContextualisedExpr({
      context,
      op: 'equals',
      args: [field.id, new ContextualisedParam({ index: 0 })],
      dataType: dataTypes.boolean,
    });

    expect(expr.requirements.sources).toEqual([testSource]);
  });

  it("won't list sources or constituent fields when there are no fields involved", () => {
    const context = new ContextualiserState(emptyConfig);
    const expr = new ContextualisedExpr({
      context,
      op: 'equals',
      args: [
        new ContextualisedParam({ index: 0 }),
        new ContextualisedParam({ index: 1 }),
      ],
      dataType: dataTypes.boolean,
    });

    expect(expr.constituentFields).toEqual([]);
    expect(expr.requirements.sources).toEqual([]);
  });
});
