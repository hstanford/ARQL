import { test } from '.';
describe('test', () => {
  it('should not throw', () => {
    expect(() => test('test')).not.toThrow();
  });
});
