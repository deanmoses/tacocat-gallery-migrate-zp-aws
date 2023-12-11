import type { Config } from 'jest';
/** @type {import('ts-jest').JestConfigWithTsJest} */
const config: Config = {
    preset: 'ts-jest',
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',
    moduleNameMapper: {
        "^(\\.\\.?\\/.+)\\.js$": "$1",
      },
    transform: { '^.+\\.spec.ts?$': ['ts-jest', { useESM: true }]},
    clearMocks: true,
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testMatch: ['**/*.spec.ts'],
};

export default config;
