// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution")

module.exports = {
  extends: [
    "@rushstack/eslint-config/profile/web-app",
    "@rushstack/eslint-config/mixins/react"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/consistent-type-definitions": [1, "type"],
    "@typescript-eslint/typedef": 0,
    "@rushstack/no-new-null": 0,
    "@rushstack/typedef-var": 0
  },
  parserOptions: { tsconfigRootDir: __dirname },
  settings: {
    react: {
      version: "17.0"
    }
  }
}
