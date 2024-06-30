module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '^@app(.*)$': '<rootDir>/src/$1',
    '^@test(.*)$': '<rootDir>/test/$1',
  },
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  testEnvironment: 'node',
  testRegex: ['/src/.*\\.(spec)\\.ts$', '/test/e2e/.*\\.(e2e-spec).ts$'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        sourceMaps: 'inline',
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', 'test/**/*.(t|j)s', '!src/**/main.ts'],
  coverageDirectory: 'coverage',
  maxWorkers: '50%',
  testTimeout: 20000,
};
