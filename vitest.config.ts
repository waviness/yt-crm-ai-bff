/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import AutoImport from 'unplugin-auto-import/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [],
      dirs: ['src/utils', 'src/config'],
      dts: false, // 测试环境不需要生成类型声明
    }) as any,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/config/**', 'src/composables/**'],
    },
  },
});
