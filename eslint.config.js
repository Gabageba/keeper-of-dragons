import { fileURLToPath } from 'url';
import path from 'path';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import-x';
import a11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'vite.config.ts',
      'eslint.config.js',
    ],
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: './tsconfig.eslint.json',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Event: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        CustomEvent: 'readonly',
        Node: 'readonly',
        NodeList: 'readonly',
        Element: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        location: 'readonly',
        history: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      import: importPlugin,
      'jsx-a11y': a11yPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: '19.2.7' },
      'import/resolver': {
        node: {
          extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx', '.d.ts'],
        },
      },
    },
    rules: {
      // Prettier
      ...prettierConfig.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // TypeScript recommended
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React recommended
      ...reactPlugin.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/no-unstable-nested-components': ['off', { allowAsProps: true }],
      'react/function-component-definition': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'react/require-default-props': 'off',
      'react/jsx-filename-extension': 'off',
      'react/prop-types': 'off',

      // React Hooks
      ...reactHooksPlugin.configs['recommended-latest'].rules,

      // Import
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/__tests__/**', '**/test/**'],
        },
      ],
      'import/prefer-default-export': 'off',

      // a11y
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',

      // General
      quotes: ['error', 'single'],
      'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
    },
  },
];
