/**
 * Vitest 测试配置
 * @description 用于配置单元测试和集成测试
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/renderer/games/**/*.ts', 'src/renderer/core/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/**/config.ts'],
    },
  },
  resolve: {
    alias: [
      { find: '@/test', replacement: resolve(__dirname, 'src/test') },
      { find: '@', replacement: resolve(__dirname, 'src/renderer') },
      { find: '@shared', replacement: resolve(__dirname, 'src/shared') },
    ],
  },
})