const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { execFileSync } = require("node:child_process")
const { PACKAGE_NAME, validateMetadata } = require("./release.cjs")
const { validateBump } = require("./version-bump.cjs")

const repository = "MFB-Technologies-Inc/react-async-renderer"
const change = type => ({
  packageName: PACKAGE_NAME,
  type,
  comment: "A change"
})

test("bump preflight rejects empty/no-bump changes, invalid entries, and duplicate PRs", () => {
  assert.throws(() => validateBump([], [], repository), /No version bump/)
  assert.throws(
    () => validateBump([change("NONE"), change("DEPENDENCY")], [], repository),
    /No version bump/
  )
  assert.throws(
    () => validateBump([change("UNKNOWN")], [], repository),
    /Invalid change/
  )
  assert.throws(
    () =>
      validateBump(
        [{ ...change("PATCH"), packageName: "other" }],
        [],
        repository
      ),
    /Invalid change/
  )
  assert.throws(
    () =>
      validateBump(
        [change("PATCH")],
        [{ head: { ref: "release/v2.2.3", repo: { full_name: repository } } }],
        repository
      ),
    /already open/
  )
  assert.doesNotThrow(() => validateBump([change("PATCH")], [], repository))
})

test("ccg apply preserves every historical entry and consumes a change in an isolated project", () => {
  const root = path.resolve(__dirname, "..")
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "release-migration-"))
  const historical = JSON.parse(
    fs.readFileSync(path.join(root, "CHANGELOG.json"), "utf8")
  )
  const markdown = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8")
  // Compare source history to Markdown before exercising the actual installed generator.
  for (const entry of historical.entries) {
    assert.ok(markdown.includes("## " + entry.version))
    assert.ok(markdown.includes(entry.date))
    for (const [type, comments] of Object.entries(entry.comments)) {
      if (type === "NONE") continue
      for (const { comment } of comments) assert.ok(markdown.includes(comment))
    }
  }
  try {
    fs.mkdirSync(path.join(directory, "changes"))
    fs.writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify({
        name: PACKAGE_NAME,
        version: historical.entries[0].version
      })
    )
    fs.writeFileSync(
      path.join(directory, "CHANGELOG.json"),
      JSON.stringify(historical)
    )
    fs.writeFileSync(path.join(directory, "CHANGELOG.md"), markdown)
    fs.writeFileSync(
      path.join(directory, "changes", "test.json"),
      JSON.stringify({ changes: [change("PATCH")] })
    )
    execFileSync(
      process.execPath,
      [
        path.join(
          root,
          "node_modules/@mfbtech/changelog-generator/out/index.cjs"
        ),
        "publish",
        "--apply"
      ],
      { cwd: directory, stdio: "pipe" }
    )
    execFileSync(
      "npm",
      [
        "install",
        "--package-lock-only",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund"
      ],
      { cwd: directory, stdio: "pipe" }
    )
    const read = file =>
      JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"))
    const result = read("CHANGELOG.json")
    assert.deepEqual(result.entries.slice(1), historical.entries)
    assert.deepEqual(fs.readdirSync(path.join(directory, "changes")), [])
    validateMetadata(
      read("package.json").version,
      result,
      read("package-lock.json")
    )
    const regenerated = fs.readFileSync(
      path.join(directory, "CHANGELOG.md"),
      "utf8"
    )
    for (const entry of historical.entries) {
      assert.ok(regenerated.includes(entry.version))
      assert.ok(regenerated.includes(entry.date))
      for (const [type, comments] of Object.entries(entry.comments)) {
        if (type !== "NONE")
          for (const { comment } of comments)
            assert.ok(regenerated.includes(comment))
      }
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
