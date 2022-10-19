import { ContextualisedParam } from './param';

describe('param', () => {
  it('can store the index of a parameter', () => {
    const param = new ContextualisedParam({
      index: 3,
    });
    expect(param.index).toEqual(3);
  });
});
