import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Test file patterns
    include: ['test/**/*.test.ts'],

    // Global setup file for shared mocks and utilities
    setupFiles: ['./test/setup.ts'],

    // Environment
    environment: 'node',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/**/index.ts'],
    },

    // Timeouts
    testTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,
    restoreMocks: true,
  },
})
