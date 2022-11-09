import { keyword } from './keyword.js';
import { assertNoError } from './test_helpers.js';

describe('keyword', () => {
  it('parses a single word correctly', () => {
    const out = keyword.run('hello');
    assertNoError(out);
    expect(out.result).toBe('hello');
  });

  it('only consumes the first word of multiple', () => {
    const out = keyword.run('hello world');
    assertNoError(out);
    expect(out.result).toBe('hello');
  });

  it('supports numbers after the first alpha char', () => {
    const out = keyword.run('h3llo');
    assertNoError(out);
    expect(out.result).toBe('h3llo');
  });

  it('does not support numbers at the start', () => {
    expect(keyword.run('3ello').isError).toBe(true);
  });
});
