/**
 * Configuration for Jest
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/tests/*.test.ts'],
  verbose: true,
  preset: 'ts-jest',
  name: 'Aoba'
};