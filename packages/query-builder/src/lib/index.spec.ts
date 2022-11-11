import { arql } from './index';

describe('query builder', () => {
  it('should correctly build a basic statement', () => {
    expect(arql`test {id: ${'test'}}`.value).toEqual({
      query: 'test {id: $1}',
      params: ['test'],
    });
  });

  it('should correctly build from a nested statement', () => {
    const expr = arql`foo = ${'bar'}`;
    expect(
      arql`test | filter(id = ${1} && ${expr}) {id: ${'test'}}`.value
    ).toEqual({
      query: 'test | filter(id = $1 && foo = $2) {id: $3}',
      params: [1, 'bar', 'test'],
    });
  });
});
