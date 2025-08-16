module.exports = {
  projects: [
    {
      displayName: 'agent',
      testMatch: ['<rootDir>/agent/src/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      collectCoverageFrom: [
        'agent/src/**/*.ts',
        '!agent/src/**/*.test.ts',
        '!agent/src/**/*.d.ts'
      ]
    },
    {
      displayName: 'app',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.d.ts'
      ]
    }
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov']
};