module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:tailwindcss/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['react', 'react-refresh', '@typescript-eslint', 'tailwindcss'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'tailwindcss/no-custom-classname': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  },
  overrides: [
    {
      files: ['*.config.{js,ts}', 'vite.config.ts', 'playwright.config.ts', 'tailwind.config.js', 'postcss.config.js'],
      rules: {
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off'
      }
    },
    {
      files: ['**/__tests__/**/*', '**/*.test.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: ['dist', '.eslintrc.cjs']
};
