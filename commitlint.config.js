module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
   'header-max-length': [2, 'always', 100],
   'header-case': [2, 'always', 'lower-case'],
   'type-empty': [2, 'never'],
   'type-case': [2, 'always', 'lower-case'],
   'type-enum': [2, 'always', ['build', 'ci', 'docs', 'test', 'style', 'fix', 'feat', 'perf', 'refactor', 'revert']],
   'subject-empty': [2, 'never'],
   'subject-case': [2, 'always', ['lower-case']],
   'subject-max-length': [2, 'always', 80],
  }
}
