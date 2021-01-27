module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['tests/**/*.test.ts', '**/?(*.)+(test).+(ts)'],
  transform: {
    '^.+\\.(ts)?$': 'ts-jest',
  },
};
