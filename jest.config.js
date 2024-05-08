/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*_test.ts"],
  collectCoverage: false,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        sourceMap: true,
        inlineSourceMap: true,
        allowJs: true,
      }
    }]
  },
  modulePathIgnorePatterns: [
    "<rootDir>/.dist",
  ],
};