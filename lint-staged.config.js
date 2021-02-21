module.exports = {
  // Run type-check on changes to TypeScript files
  '**/*.ts': () => 'yarn type-check',
  // Run ESLint on changes to JavaScript/TypeScript files
  '**/*.(ts|js)': filenames => `yarn lint ${filenames.join(' ')}`,
  // Run prettier on changes to js, ts, json, md
  '**/*.(js|ts|json|md)': filenames => `yarn format ${filenames.join(' ')}`,
  // Run jest on changes to ts, tsx
  '**/*.test.ts': filenames =>
    `yarn test --passWithNoTests ${filenames.join(' ')}`,
};
