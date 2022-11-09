import { shape } from './shape.js';
import { assertNoError } from './test_helpers.js';

describe('shape', () => {
  it('should match a simple field in curly braces', () => {
    const out = shape.run('{name}');
    assertNoError(out);
    expect(out.result).toEqual({
      type: 'shape',
      fields: [
        {
          type: 'field',
          alias: 'name',
          value: {
            type: 'alphachain',
            root: 'name',
            parts: [],
          },
        },
      ],
    });
  });
});
