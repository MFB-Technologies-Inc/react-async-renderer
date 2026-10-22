const { test } = require("node:test")
const assert = require("node:assert/strict")
const {
  PACKAGE_NAME,
  previousRelease,
  validateMetadata,
  releaseNotes,
  createTag,
  validateTag
} = require("./release.cjs")

const entry = version => ({
  version,
  date: "today",
  comments: {
    PATCH: [{ comment: "Fix for " + version }],
    NONE: [{ comment: "internal" }]
  }
})
const changelog = {
  name: PACKAGE_NAME,
  entries: ["1.0.3", "1.0.2", "1.0.1"].map(entry)
}
const lock = {
  name: PACKAGE_NAME,
  version: "1.0.3",
  packages: { "": { name: PACKAGE_NAME, version: "1.0.3" } }
}

test("requires matching valid release metadata", () => {
  assert.doesNotThrow(() => validateMetadata("1.0.3", changelog, lock))
  assert.throws(() => validateMetadata("invalid", changelog, lock))
  assert.throws(() => validateMetadata("1.0.2", changelog, lock))
  assert.throws(() =>
    validateMetadata("1.0.3", changelog, { ...lock, version: "1.0.2" })
  )
})

test("includes all bumps after the previous release, excluding published and internal notes", () => {
  const notes = releaseNotes(changelog, "1.0.3", "1.0.1")
  assert.match(notes, /Fix for 1.0.3/)
  assert.match(notes, /Fix for 1.0.2/)
  assert.doesNotMatch(notes, /1.0.1|internal/)
})
test("first release includes all history", () => {
  assert.match(releaseNotes(changelog, "1.0.3"), /Fix for 1.0.1/)
})
test("rejects missing, invalid and newer release boundaries", () => {
  for (const previous of ["0.9.0", "bad", "1.0.3", "2.0.0"]) {
    assert.throws(() => releaseNotes(changelog, "1.0.3", previous))
  }
})

test("tags a merged bump once and validates tags after later commits", () => {
  const fs = require("node:fs")
  const os = require("node:os")
  const path = require("node:path")
  const { execFileSync } = require("node:child_process")
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "release-tag-"))
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim()
  const writeVersion = version =>
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ version })
    )
  try {
    git("init", "-b", "main")
    git("config", "user.name", "Test")
    git("config", "user.email", "test@example.com")
    git("init", "--bare", "remote.git")
    git("remote", "add", "origin", path.join(dir, "remote.git"))
    writeVersion("1.0.2")
    git("add", "package.json")
    git("commit", "-m", "Initial")
    git("switch", "-c", "release/v1.0.3")
    writeVersion("1.0.3")
    git("commit", "-am", "Any bump message")
    assert.throws(
      () => createTag(git, "1.0.3", "release/v1.0.3"),
      /merge commit/
    )
    git("switch", "main")
    git("merge", "--no-ff", "release/v1.0.3", "-m", "Any merge message")
    const merged = git("rev-parse", "HEAD")
    assert.throws(() => createTag(git, "1.0.3", "release/v1.0.4"))
    assert.throws(() => createTag(git, "1.0.2", "release/v1.0.2"))
    createTag(git, "1.0.3", "release/v1.0.3")
    const original = git("rev-parse", "refs/tags/v1.0.3")
    const calls = []
    createTag(
      (...args) => {
        calls.push(args[0])
        return git(...args)
      },
      "1.0.3",
      "release/v1.0.3"
    )
    assert.equal(git("rev-parse", "refs/tags/v1.0.3"), original)
    assert.equal(calls.includes("push"), false)
    git("commit", "--allow-empty", "-m", "Later work")
    git("push", "origin", "main")
    assert.throws(() => validateTag(git, "v1.0.3", "1.0.3", "main"))
    git("checkout", "--detach", "v1.0.3")
    validateTag(git, "v1.0.3", "1.0.3", "main")
    assert.throws(() => validateTag(git, "v1.0.4", "1.0.3", "main"))
    assert.throws(() => validateTag(git, "v9.0.0", "9.0.0", "main"))
    git("checkout", "-b", "unmerged")
    writeVersion("1.0.4")
    git("commit", "-am", "Unmerged bump")
    git("tag", "v1.0.4")
    assert.throws(() => validateTag(git, "v1.0.4", "1.0.4", "main"))
    git("checkout", "--detach", merged)
    git("tag", "-f", "v1.0.3", "HEAD^1")
    assert.throws(() => createTag(git, "1.0.3", "release/v1.0.3"))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test("rejects prereleases, build metadata, duplicate history and root lock mismatches", () => {
  for (const version of ["1.0.3-rc.1", "1.0.3+build", "v1.0.3"]) {
    assert.throws(() => validateMetadata(version, changelog, lock))
  }
  assert.throws(() =>
    validateMetadata("1.0.3", changelog, {
      ...lock,
      packages: { "": { name: PACKAGE_NAME, version: "1.0.2" } }
    })
  )
  assert.throws(() =>
    validateMetadata(
      "1.0.3",
      { ...changelog, entries: [entry("1.0.3"), entry("1.0.3")] },
      lock
    )
  )
  assert.throws(() =>
    validateMetadata("1.0.3", { ...changelog, name: "wrong-package" }, lock)
  )
})

test("release boundary excludes drafts, prereleases, and the release being retried", () => {
  const release = (tag_name, published_at, extra = {}) => ({
    tag_name,
    published_at,
    draft: false,
    prerelease: false,
    ...extra
  })
  assert.equal(
    previousRelease(
      [
        release("v1.0.1", "2026-01-01"),
        release("v1.0.2", "2026-01-02"),
        release("v1.0.3", "2026-01-03"),
        release("v1.0.4", "2026-01-04", { draft: true }),
        release("v2.0.0-rc.1", "2026-01-05", { prerelease: true })
      ],
      "v1.0.3"
    ),
    "v1.0.2"
  )
  assert.equal(previousRelease([], "v1.0.3"), undefined)
  assert.throws(() =>
    previousRelease([release("release-timestamp", "2026-01-01")], "v1.0.3")
  )
})
