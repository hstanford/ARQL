import { alias } from './alias';
import { assertNoError } from './test_helpers';

describe('alias', () => {
  it('matches a keyword followed by a colon', () => {
    const out = alias.run('test:');
    assertNoError(out);
    expect(out.result).toBe('test');
  });

  it('matches a keyword followed by a colon with extra whitespace', () => {
    const out = alias.run('test  :');
    assertNoError(out);
    expect(out.result).toBe('test');
  });
});
