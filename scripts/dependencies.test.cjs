const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const semver = require("semver")

const ROOT = path.join(__dirname, "..")
const CHANGES_DIR = path.join(ROOT, "changes")
const PACKAGE_NAME = "@mfbtech/react-async-renderer"
const CHANGE_FILE_PREFIX = "issue-119-bump-deps"
const CHANGE_TYPE_DEPENDENCY = "DEPENDENCY"
const EXACT_VERSION = /^\d+\.\d+\.\d+$/

const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"))
const packageJson = () => readJson(path.join(ROOT, "package.json"))
const lockfile = () => readJson(path.join(ROOT, "package-lock.json"))
const installedVersion = name =>
  readJson(path.join(ROOT, "node_modules", name, "package.json")).version

// Newest release within the current major on the npm registry (2026-11-17).
// A newer release in the same major is also accepted.
const MINIMUM_VERSIONS = {
  "@mfbtech/changelog-generator": "1.0.4",
  "@types/jest": "29.5.14",
  "@types/node": "18.19.130",
  "@types/react": "17.0.93",
  "@typescript-eslint/eslint-plugin": "7.18.0",
  "@typescript-eslint/parser": "7.18.0",
  "eslint": "8.57.1",
  "eslint-plugin-react": "7.37.5",
  "eslint-plugin-react-hooks": "4.6.2",
  "prettier": "3.10.1",
  "rimraf": "5.0.10",
  "sass": "1.108.2",
  "semver": "7.8.6",
  "ts-jest": "29.4.15",
  "typescript": "5.9.3"
}

// Already newest within their major: must not move.
const UNCHANGED_VERSIONS = {
  "@testing-library/react": "12.1.5",
  "identity-obj-proxy": "3.0.0",
  "jest": "29.7.0",
  "jest-environment-jsdom": "29.7.0",
  "jest-standard-reporter": "2.0.0",
  "eslint-config-react-app": "7.0.1",
  "react": "17.0.2",
  "react-dom": "17.0.2"
}

const PEER_DEPENDENCIES = {
  "react": "^17.0.2 || 18",
  "react-dom": "^17.0.2 || 18",
  "@types/react": "^17.0.15 || 18"
}

const bumpedEntries = Object.entries(MINIMUM_VERSIONS)

test("bumped devDependencies are pinned exactly at the newest release within their major", () => {
  const devDependencies = packageJson().devDependencies
  bumpedEntries.forEach(([name, minimum]) => {
    const pinned = devDependencies[name]
    assert.match(pinned, EXACT_VERSION, `${name} must stay an exact pin`)
    assert.equal(
      semver.major(pinned),
      semver.major(minimum),
      `${name} must not change major`
    )
    assert.ok(
      semver.gte(pinned, minimum),
      `${name} is ${pinned}, expected >= ${minimum}`
    )
  })
})

test("devDependencies already at the newest in their major are unchanged", () => {
  const devDependencies = packageJson().devDependencies
  Object.entries(UNCHANGED_VERSIONS).forEach(([name, version]) =>
    assert.equal(devDependencies[name], version, `${name} must not change`)
  )
})

test("no devDependencies are added or removed", () => {
  const expectedNames = [
    ...Object.keys(MINIMUM_VERSIONS),
    ...Object.keys(UNCHANGED_VERSIONS)
  ].sort()
  assert.deepEqual(
    Object.keys(packageJson().devDependencies).sort(),
    expectedNames
  )
})

test("peerDependencies ranges are unchanged", () => {
  assert.deepEqual(packageJson().peerDependencies, PEER_DEPENDENCIES)
})

test("package-lock.json is regenerated to match package.json", () => {
  const manifest = packageJson()
  const lock = lockfile()
  const rootEntry = lock.packages[""]
  assert.deepEqual(rootEntry.devDependencies, manifest.devDependencies)
  assert.deepEqual(rootEntry.peerDependencies, manifest.peerDependencies)
  Object.entries(manifest.devDependencies).forEach(([name, version]) =>
    assert.equal(
      lock.packages[`node_modules/${name}`]?.version,
      version,
      `lockfile resolves ${name} to the pinned version`
    )
  )
})

test("installed bumped devDependencies match their pins", () => {
  const devDependencies = packageJson().devDependencies
  bumpedEntries.forEach(([name]) =>
    assert.equal(
      installedVersion(name),
      devDependencies[name],
      `node_modules/${name} must match package.json`
    )
  )
})

test("a DEPENDENCY change file is added for the bump", () => {
  const changeFiles = fs
    .readdirSync(CHANGES_DIR)
    .filter(file => file.startsWith(CHANGE_FILE_PREFIX))
  assert.equal(changeFiles.length, 1, "exactly one issue-119 change file")
  const { changes } = readJson(path.join(CHANGES_DIR, changeFiles[0]))
  assert.equal(changes.length, 1)
  assert.equal(changes[0].packageName, PACKAGE_NAME)
  assert.equal(changes[0].type, CHANGE_TYPE_DEPENDENCY)
  assert.ok(changes[0].comment.length > 0, "change comment is not empty")
})
