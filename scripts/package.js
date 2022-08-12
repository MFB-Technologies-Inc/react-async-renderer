#!/usr/bin/env node
// Copyright 2022 MFB Technologies, Inc.

const path = require("path");
const fs = require("fs");
const childProcess = require('child_process');

const targetPackDirectory = path.join(__dirname, ".." ,"packed");
const npmPackCommand = `npm pack --pack-destination ${targetPackDirectory}`;

(function main() {
  fs.mkdir(targetPackDirectory, { recursive: true }, (err) => {
    if (err) throw err;
  });
  childProcess.execSync(npmPackCommand)
})();