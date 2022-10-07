// Copyright 2022 MFB Technologies, Inc.

module.exports = {
  extends: [
    "react-app"
  ],
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      rules: {
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/consistent-type-definitions": [1, "type"],
        "@typescript-eslint/typedef": 0,
      }
    }
  ]
}
