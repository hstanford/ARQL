import { shape } from './shape';
import { assertNoError } from './test_helpers';

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
