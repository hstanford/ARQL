import { opchar } from './op';
import { assertNoError } from './test_helpers';

describe('opchar', () => {
  it('matches "&"', () => {
    const out = opchar.run('&');
    assertNoError(out);
    expect(out.result).toBe('&');
  });
  it('does not match "h"', () => {
    const out = opchar.run('h');
    expect(out.isError).toBe(true);
  });
});
