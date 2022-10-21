import { param } from './param';
import { assertNoError } from './test_helpers';

describe('param', () => {
  it('matches "$" followed by a single digit', () => {
    const out = param.run('$1');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'param',
      index: 1,
    });
  });

  it('matches "$" followed by a sequence of digits', () => {
    const out = param.run('$987654321');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'param',
      index: 987654321,
    });
  });
});
