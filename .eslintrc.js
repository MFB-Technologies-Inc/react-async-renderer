// Copyright 2022 MFB Technologies, Inc.

module.exports = {
  settings: {
    react: {
      version: "detect"
    }
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    },
    project: ["./tsconfig.json"]
  },
  env: {
    es6: true,
    browser: true,
    node: true
  },
  ignorePatterns: ".eslintrc.js",
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:react/jsx-runtime"
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-void": [1, { allowAsStatement: true }],
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/consistent-type-definitions": [1, "type"],
        "@typescript-eslint/typedef": 0,
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "parameter",
            format: ["camelCase"],
            leadingUnderscore: "allow"
          }
        ],
        "@typescript-eslint/no-floating-promises": [
          1,
          {
            ignoreVoid: true
          }
        ],
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "react/forbid-foreign-prop-types": ["warn", { allowInPropTypes: true }],
        "react/jsx-no-comment-textnodes": "warn",
        "react/jsx-no-duplicate-props": "warn",
        "react/jsx-no-target-blank": "warn",
        "react/jsx-no-undef": "error",
        "react/jsx-pascal-case": [
          "warn",
          {
            allowAllCaps: true,
            ignore: []
          }
        ],
        "react/no-danger-with-children": "warn",
        "react/no-direct-mutation-state": "warn",
        "react/no-is-mounted": "warn",
        "react/no-typos": "error",
        "react/require-render-return": "error",
        "react/style-prop-object": "warn"
      }
    }
  ]
}
