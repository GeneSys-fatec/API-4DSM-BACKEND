import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      
      include: [
        'src/services/**/*.ts', 
        'src/controllers/**/*.ts'
      ],
      exclude: [
        'src/**/*.spec.ts', 
        'src/**/*.test.ts', 
        'src/**/*.d.ts'
      ],
      
      thresholds: {
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1
      }
    },
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
});
