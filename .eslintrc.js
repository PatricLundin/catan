module.exports = {
  root: true,

  env: {
    browser: true,
    node: true
  },

  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2020
  },

  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'airbnb-base'
  ],

  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'arrow-parens': [1, 'as-needed'],
    'import/no-dynamic-require': 0,
    'global-require': 0,
    'max-len': ['error', { code: 150, ignoreComments: true }],
    'linebreak-style': 0,
    'no-await-in-loop': 0,
    'no-loop-func': 0,
  },
}
