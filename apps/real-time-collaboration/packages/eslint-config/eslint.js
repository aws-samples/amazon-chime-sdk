require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:eslint-comments/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'no-null',
    'prefer-arrow',
    'promise',
    'unicorn',
  ],
  rules: {
    // @typescript-eslint
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        "assertionStyle": "as",
        "objectLiteralTypeAssertions": "never"
      }
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/explicit-module-boundary-types': [
      'error',
      { allowArgumentsExplicitlyTypedAsAny: true },
    ],
    // TODO: Fix the project to enable this
    '@typescript-eslint/no-non-null-assertion': 'off',

    // Once we migrate from the AWS SDK for JavaScript version 2 to version 3,
    // we should enable these rules.
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',

    // eslint-plugin-import
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',

    // eslint-plugin-no-null
    'no-null/no-null': 'off',

    // eslint-plugin-prefer-arrow
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: false,
        singleReturnOnly: true,
        classPropertiesAllowed: false,
      },
    ],

    // eslint-plugin-unicorn
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    'unicorn/no-null': 'off',
    'unicorn/no-unsafe-regex': 'error',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/empty-brace-spaces': 'off', // Off to avoid conflicts with typescript-formatter

    // eslint
    'class-methods-use-this': 'off',
    "linebreak-style": "off", // Off to avoid conflicts with typescript-formatter
    'no-console': 'off',
    'no-restricted-syntax': ['error', 'ForInStatement'],
    'no-void': 'off',
    'max-classes-per-file': 'off',
    'max-len': [
      'error',
      {
        ignoreRegExpLiterals: false,
        ignoreStrings: false,
        code: 120,
      },
    ],
  },
};
