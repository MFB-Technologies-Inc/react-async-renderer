// Copyright 2021 MFB Technologies, Inc.

module.exports = {
  testMatch: ["<rootDir>/src/**/*.(spec|test).ts?(x)"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy"
  }
}
