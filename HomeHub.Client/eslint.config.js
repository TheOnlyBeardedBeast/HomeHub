import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Rules that keep the client small and single-purpose. Size limits are warnings:
 * they mark files that should be split rather than failing the build.
 */
export default [
  { ignores: ['dist/**', 'node_modules/**', 'src/gen/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  { settings: { react: { version: 'detect' } } },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-max-depth': ['warn', { max: 8 }],
      'react/jsx-no-useless-fragment': 'warn',
      'react/self-closing-comp': 'warn',
      // Handlers are named in the component body or module scope, never created in JSX.
      'react/jsx-no-bind': [
        'warn',
        {
          allowArrowFunctions: false,
          allowFunctions: false,
          allowBind: false,
          ignoreRefs: true,
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Single-responsibility pressure: files and functions that outgrow these
      // limits should be split rather than exempted.
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 3],
      'max-params': ['warn', 4],
      complexity: ['warn', 12],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['warn', 'smart'],
    },
  },
  {
    files: ['scripts/**/*.ts', '*.config.{js,ts}', 'vite.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
];
