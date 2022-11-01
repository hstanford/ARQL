import { sourcePostgresql } from './source-postgresql';

describe('sourcePostgresql', () => {
  it('should work', () => {
    expect(sourcePostgresql()).toEqual('source-postgresql');
  });
});
