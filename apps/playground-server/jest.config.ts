/* eslint-disable */
export default {
  displayName: 'playground-server',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/playground-server',
  moduleNameMapper: {
    '@arql/core': '<rootDir>/../../packages/core/src/index.ts',
    '@arql/collector': '<rootDir>/../../packages/collector/src/index.ts',
    '@arql/delegator': '<rootDir>/../../packages/delegator/src/index.ts',
    '@arql/parser': '<rootDir>/../../packages/parser/src/index.ts',
    '@arql/contextualiser':
      '<rootDir>/../../packages/contextualiser/src/index.ts',
    '@arql/models': '<rootDir>/../../packages/models/src/index.ts',
    '@arql/types': '<rootDir>/../../packages/types/src/index.ts',
    '@arql/util': '<rootDir>/../../packages/util/src/index.ts',
    '@arql/source-js': '<rootDir>/../../packages/source-js/src/index.ts',
    '@arql/source-postgresql':
      '<rootDir>/../../packages/source-postgresql/src/index.ts',
  },
};
