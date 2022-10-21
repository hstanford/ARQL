import { alphachain, dotSequence } from './alphachain';
import { assertNoError } from './test_helpers';

describe('dotSequence', () => {
  it('does not match an empty string', () => {
    const out = dotSequence.run('');
    expect(out.isError).toBe(true);
  });

  it('matches one keyword preceeded by "." if there is only one keyword', () => {
    const out = dotSequence.run('.hello');
    assertNoError(out);
    expect(out.result).toBe('hello');
  });

  it('matches one keyword preceeded by "." if there are multiple keywords', () => {
    const out = dotSequence.run('.hello.there');
    assertNoError(out);
    expect(out.result).toBe('hello');
  });
});

describe('alphachain', () => {
  it('does not match an empty string', () => {
    const out = alphachain.run('');
    expect(out.isError).toBe(true);
  });

  it('matches a single keyword', () => {
    const out = alphachain.run('hello');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'alphachain',
      root: 'hello',
      parts: [],
    });
  });

  it('matches dot-separated keywords', () => {
    const out = alphachain.run('hello.world');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'alphachain',
      root: 'hello',
      parts: ['world'],
    });
  });

  it('matches dot-separated keywords over newlines', () => {
    const out = alphachain.run(
      `hello
    .world
    .foo`
    );
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'alphachain',
      root: 'hello',
      parts: ['world', 'foo'],
    });
  });
});
