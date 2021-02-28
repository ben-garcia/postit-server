module.exports = {
  collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**'],
  roots: ['<rootDir>/tests'],
  testMatch: ['tests/**/*.test.ts', '**/?(*.)+(test).+(ts)'],
  transform: {
    '^.+\\.(ts)?$': 'ts-jest',
  },
};
