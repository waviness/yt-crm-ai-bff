import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import vuePlugin from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'src/static/**',
      'src/uni_modules/**',
      '*.d.ts',
      '**/*.d.ts',
      'config/**',
      'docs/**',
      '*.md',
      '*.config.*',
      '*.zip',
      '*.log',
      '.cache/**',
      '.vscode/**',
      '.history/**',
      '.idea/**',
      'coverage/**',
      'stats.html',
      'pnpm-lock.yaml',
      'yarn.lock',
      'package-lock.json',
    ],
  },

  // 基础 JavaScript 配置
  {
    files: ['src/**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // node globals
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-comments': 'off',
      'spaced-comment': 'off',
      'no-unused-vars': 'off',
    },
  },

  // TypeScript 配置
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Vue 配置
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        sourceType: 'module',
      },
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'vue/no-mutating-props': 'error',
      'vue/no-setup-props-destructure': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },

  // Prettier 配置
  {
    files: ['src/**/*.{js,ts,vue}'],
    ...prettierConfig,
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // 测试文件配置
  {
    files: ['src/**/*.test.{js,ts}'],
    rules: { 'no-undef': 'off' },
  },

  // BFF API 配置
  {
    files: ['api/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
