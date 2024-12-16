/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    collectCoverage: process.env.COLLECT_COVERAGE !== '0',
    collectCoverageFrom: ['lib/**/*.ts'],
    clearMocks: true,
    verbose: true,
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
    testResultsProcessor: 'jest-sonar-reporter',
    reporters: ['default', process.env.GITHUB_ACTIONS === 'true' ? 'jest-github-actions-reporter' : null].filter(
        Boolean,
    ),
    testLocationInResults: true,
};
