const fs = require("node:fs")
const path = require("node:path")
const semver = require("semver")
const {
  PACKAGE_NAME,
  RELEASE_PREFIX,
  validateMetadata,
  run
} = require("./release.cjs")

function validateBump(changes, pulls, repository) {
  if (
    pulls.some(
      pr =>
        pr.head.repo?.full_name === repository &&
        pr.head.ref.startsWith(RELEASE_PREFIX)
    )
  ) {
    throw new Error(
      "A release PR is already open. Finish it or close it and delete its branch first."
    )
  }
  const types = ["NONE", "DEPENDENCY", "PATCH", "MINOR", "MAJOR"]
  if (
    changes.some(
      change =>
        change.packageName !== PACKAGE_NAME ||
        !types.includes(change.type) ||
        typeof change.comment !== "string"
    )
  ) {
    throw new Error("Invalid change file entry.")
  }
  if (
    !changes.some(change => ["PATCH", "MINOR", "MAJOR"].includes(change.type))
  ) {
    throw new Error(
      "No version bump. Add a PATCH, MINOR, or MAJOR change file first."
    )
  }
}

function main() {
  const read = file => JSON.parse(fs.readFileSync(file, "utf8"))
  const mode = process.argv[2]
  const defaultBranch = process.env.DEFAULT_BRANCH
  if (!defaultBranch) throw new Error("DEFAULT_BRANCH is required.")
  if (mode === "prepare") {
    const pulls = JSON.parse(
      run("gh", [
        "api",
        "--paginate",
        "--slurp",
        `repos/{owner}/{repo}/pulls?state=open&base=${encodeURIComponent(defaultBranch)}&per_page=100`
      ])
    ).flat()
    const changes = fs
      .readdirSync("changes")
      .filter(file => file.endsWith(".json"))
      .flatMap(file => read(path.join("changes", file)).changes)
    validateBump(changes, pulls, process.env.GITHUB_REPOSITORY)
    const before = read("package.json").version
    run(process.execPath, [
      "node_modules/@mfbtech/changelog-generator/out/index.cjs",
      "publish",
      "--apply"
    ])
    const { version } = read("package.json")
    if (!semver.gt(version, before))
      throw new Error("Changelog generator did not increase the version.")
    run("npm", [
      "install",
      "--package-lock-only",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund"
    ])
    run(process.execPath, [
      "node_modules/prettier/bin/prettier.cjs",
      "--write",
      "CHANGELOG.json",
      "package.json"
    ])
    validateMetadata(version, read("CHANGELOG.json"), read("package-lock.json"))
    const branch = RELEASE_PREFIX + version
    if (
      run("git", ["ls-remote", "--heads", "origin", "refs/heads/" + branch])
    ) {
      throw new Error(
        "Release branch already exists. Recover its PR or remove the abandoned branch before retrying."
      )
    }
    return
  }
  if (mode !== "open") throw new Error("Expected prepare or open.")
  const { version } = read("package.json")
  validateMetadata(version, read("CHANGELOG.json"), read("package-lock.json"))
  const branch = RELEASE_PREFIX + version
  run("git", ["switch", "-c", branch])
  run("git", ["config", "user.name", "github-actions[bot]"])
  run("git", [
    "config",
    "user.email",
    "41898282+github-actions[bot]@users.noreply.github.com"
  ])
  run("git", [
    "add",
    "package.json",
    "package-lock.json",
    "CHANGELOG.json",
    "CHANGELOG.md",
    "changes/"
  ])
  run("git", ["commit", "-m", `chore(release): v${version}`])
  run("git", ["push", "origin", branch])
  const body = path.join(process.env.RUNNER_TEMP, "release-pr.md")
  fs.writeFileSync(
    body,
    `## Summary\n\n- Apply pending change files and prepare v${version}.\n- Synchronize package/lockfile versions and changelogs.\n\nApprove workflow runs if GitHub requests it, then review and merge using **Create a merge commit**. Merging automatically tags and publishes to npm and GitHub.\n`
  )
  console.log(
    run("gh", [
      "pr",
      "create",
      "--base",
      defaultBranch,
      "--head",
      branch,
      "--title",
      `chore(release): v${version}`,
      "--body-file",
      body
    ])
  )
}

module.exports = { validateBump }
if (require.main === module) main()
