import { ContextualisedCollection } from './collection';
import { ContextualisedExpr } from './expr';
import { ContextualisedField } from './field';
import { barField, fooField, testModel, testSource } from './test_helpers';
import { ContextualisedParam } from './param';

describe('expr', () => {
  it('can list the fields that constitute the expression with one field', () => {
    const expr = new ContextualisedExpr({
      op: 'equals',
      args: [
        fooField,
        new ContextualisedParam({
          index: 0,
        }),
      ],
    });

    expect(expr.constituentFields.map((cf) => cf.def)).toEqual([fooField.def]);
  });

  it('can list the fields that constitute the expression with multiple fields', () => {
    const expr = new ContextualisedExpr({
      op: 'equals',
      args: [fooField, barField],
    });

    expect(expr.constituentFields.map((cf) => cf.def)).toEqual([
      fooField.def,
      barField.def,
    ]);
  });

  it('can list the fields that constitute the expression with nested fields', () => {
    const field = new ContextualisedField({
      field: fooField,
      name: 'foo',
      origin: new ContextualisedCollection({
        origin: testModel,
        name: 'testtest',
      }),
    });
    const expr = new ContextualisedExpr({
      op: 'equals',
      args: [field, new ContextualisedParam({ index: 0 })],
    });

    expect(expr.constituentFields.map((cf) => cf.def)).toEqual([field.def]);
  });

  it('can list the sources that constitute the expression with nested fields', () => {
    const field = new ContextualisedField({
      field: fooField,
      name: 'foo',
      origin: new ContextualisedCollection({
        origin: testModel,
        name: 'testtest',
      }),
    });
    const expr = new ContextualisedExpr({
      op: 'equals',
      args: [field, new ContextualisedParam({ index: 0 })],
    });

    expect(expr.sources).toEqual([testSource]);
  });

  it("won't list sources or constituent fields when there are no fields involved", () => {
    const expr = new ContextualisedExpr({
      op: 'equals',
      args: [
        new ContextualisedParam({ index: 0 }),
        new ContextualisedParam({ index: 1 }),
      ],
    });

    expect(expr.constituentFields).toEqual([]);
    expect(expr.sources).toEqual([]);
  });
});
