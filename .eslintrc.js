module.exports = {
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
  ],
  env: {
    browser: true,
    'cypress/globals': true,
  },
  parser: 'babel-eslint',
  plugins: [
    'cypress',
    'flowtype',
  ],
};
