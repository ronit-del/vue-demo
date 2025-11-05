module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential', // or 'plugin:vue/vue3-recommended'
    'eslint:recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser', // handles <script> section
    requireConfigFile: false,       // allows no .babelrc
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'off'
  },
};