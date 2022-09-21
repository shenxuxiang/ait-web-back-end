module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  extends: [
    "airbnb",
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
      jsx: false,
    },
    sourceType: 'module',
    // 不检索配置文件
    requireConfigFile: false,
    ecmaVersion: 'latest',
  },
  env: {
    node: true,
    commonjs: true,
    es6: true,
  },
  rules: {
    'no-console': [0],
    'func-names': [0],
    'consistent-return': [0],
    'no-underscore-dangle': [0],
    'max-len': [2, 120],
    'no-plusplus': [0],
  },
  settings: {
    // 添加该配置是为了解决每次运行 lint 检查后，
    // Warning: React version not specified in eslint-plugin-react settings.
    // 添加该配置后，上述问题就可以解决了。
    react: {
      version: "999.999.999"
    }
  }
}
