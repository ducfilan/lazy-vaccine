/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  clearMocks: true,
  globalSetup: './tests/config/setup.ts',
  globalTeardown: './tests/config/teardown.ts',
  setupFilesAfterEnv: ['./tests/config/setupAfterEnv.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "@img/(.*)$": "<rootDir>/src/images/$1",
    "@hooks/(.*)$": "<rootDir>/src/common/hooks/$1",
    "@consts/(.*)$": "<rootDir>/src/common/consts/$1",
    "@facades/(.*)$": "<rootDir>/src/common/facades/$1",
    "@bg/(.*)$": "<rootDir>/src/background/$1",
  }
}
