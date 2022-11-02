/* eslint-disable */
export default {
  displayName: 'contextualiser',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/contextualiser',
  moduleNameMapper: {
    '@arql/models': '<rootDir>/../../packages/models/src/index.ts',
    '@arql/operations': '<rootDir>/../../packages/operations/src/index.ts',
    '@arql/operators': '<rootDir>/../../packages/operators/src/index.ts',
    '@arql/parser': '<rootDir>/../../packages/parser/src/index.ts',
    '@arql/util': '<rootDir>/../../packages/util/src/index.ts',
  },
};
