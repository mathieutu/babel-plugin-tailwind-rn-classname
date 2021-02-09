module.exports = {
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/semi': ['error', 'never'],
    'consistent-return': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'max-len': ['warn', 120]
  },
}
