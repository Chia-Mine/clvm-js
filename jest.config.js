/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*_test.ts"],
  collectCoverage: false,
  globals: {
    "ts-jest": {
      tsConfig: {
        sourceMap: true,
        inlineSourceMap: true,
      }
    },
  },
  modulePathIgnorePatterns: [
    "<rootDir>/.dist",
  ],
};