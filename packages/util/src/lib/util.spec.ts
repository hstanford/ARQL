import { uniq, uniqBy } from './util';

describe('uniq', () => {
  it('should deduplicate an array by reference', () => {
    const item = {};
    const duplicatedItem = {};
    expect(
      uniq([duplicatedItem, item, duplicatedItem, duplicatedItem])
    ).toEqual([duplicatedItem, item]);
  });
});

describe('uniqBy', () => {
  it('should deduplicate an array by value', () => {
    const item = { a: 1 };
    const duplicatedItem = { a: 2 };
    const duplicatedItem2 = { a: 2 };
    expect(
      uniqBy([duplicatedItem, item, duplicatedItem2, duplicatedItem], 'a')
    ).toEqual([duplicatedItem, item]);
  });
});
