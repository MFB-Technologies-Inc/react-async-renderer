const fs = require("node:fs")
const path = require("node:path")
const { execFileSync } = require("node:child_process")
const semver = require("semver")

const PACKAGE_NAME = "@mfbtech/react-async-renderer"
const RELEASE_PREFIX = "release/v"
const run = (command, args) =>
  execFileSync(command, args, { encoding: "utf8" }).trim()
const git = (...args) => run("git", args)
const read = file => JSON.parse(fs.readFileSync(file, "utf8"))

function stableVersion(version) {
  return (
    semver.valid(version) === version &&
    !semver.prerelease(version) &&
    !version.includes("+")
  )
}

function validateMetadata(version, changelog, lock) {
  if (!stableVersion(version))
    throw new Error("Invalid stable package version.")
  if (
    changelog.name !== PACKAGE_NAME ||
    changelog.entries[0]?.version !== version ||
    lock.name !== PACKAGE_NAME ||
    lock.version !== version ||
    lock.packages?.[""]?.name !== PACKAGE_NAME ||
    lock.packages[""].version !== version
  )
    throw new Error(
      "Package, lockfile, and newest changelog metadata must agree."
    )
  changelog.entries.forEach((entry, index) => {
    if (
      !stableVersion(entry.version) ||
      (index > 0 &&
        !semver.gt(changelog.entries[index - 1].version, entry.version))
    ) {
      throw new Error(
        "Changelog versions must be unique stable versions in descending order."
      )
    }
  })
}

function releaseNotes(changelog, version, previous) {
  if (previous && (!stableVersion(previous) || !semver.lt(previous, version))) {
    throw new Error(
      "The previous release must be older than the package version."
    )
  }
  if (
    previous &&
    !changelog.entries.some(entry => entry.version === previous)
  ) {
    throw new Error("Previous release is missing from CHANGELOG.json.")
  }
  const entries = changelog.entries.filter(
    entry =>
      semver.lte(entry.version, version) &&
      (!previous || semver.gt(entry.version, previous))
  )
  if (!entries.length) throw new Error("No unreleased changelog entries.")
  return (
    entries
      .map(entry => {
        const sections = Object.entries(entry.comments)
          .filter(([type]) => type !== "NONE")
          .map(
            ([type, comments]) =>
              "### " +
              type +
              " changes\n\n" +
              comments.map(({ comment }) => "- " + comment).join("\n")
          )
        return (
          "## " +
          entry.version +
          "\n\n" +
          entry.date +
          "\n\n" +
          (sections.join("\n\n") || "Version update only.")
        )
      })
      .join("\n\n") + "\n"
  )
}

function createTag(git, version, branch) {
  if (!stableVersion(version) || branch !== RELEASE_PREFIX + version) {
    throw new Error(
      "Version bump branch does not match a stable package version."
    )
  }
  if (git("rev-list", "--parents", "-n", "1", "HEAD").split(" ").length !== 3) {
    throw new Error("Release PRs require a merge commit with two parents.")
  }
  const previous = JSON.parse(git("show", "HEAD^1:package.json")).version
  const proposed = JSON.parse(git("show", "HEAD^2:package.json")).version
  if (!semver.gt(version, previous) || proposed !== version) {
    throw new Error(
      "Merged PR must increase the package version and match its head."
    )
  }
  const tag = "v" + version
  const ref = "refs/tags/" + tag
  if (git("tag", "--list", tag)) {
    if (git("rev-parse", ref + "^{commit}") !== git("rev-parse", "HEAD")) {
      throw new Error(
        "Existing tag points to a different commit; tags must never move."
      )
    }
    return
  }
  git("tag", "-a", tag, "-m", tag)
  git("push", "origin", ref)
}

function validateTag(git, tag, version, defaultBranch) {
  if (!stableVersion(version) || tag !== "v" + version)
    throw new Error("Tag must match the stable package version.")
  if (
    git("rev-parse", "refs/tags/" + tag + "^{commit}") !==
    git("rev-parse", "HEAD")
  ) {
    throw new Error("Checkout must match the existing release tag.")
  }
  git(
    "merge-base",
    "--is-ancestor",
    "HEAD",
    "refs/remotes/origin/" + defaultBranch
  )
}

function getReleases() {
  return JSON.parse(
    run("gh", ["api", "--paginate", "--slurp", "repos/{owner}/{repo}/releases"])
  ).flat()
}

function previousRelease(releases, tag) {
  const stable = releases.filter(
    release => !release.draft && !release.prerelease && release.tag_name !== tag
  )
  stable.sort((a, b) => b.published_at.localeCompare(a.published_at))
  const previous = stable[0]?.tag_name
  if (
    previous &&
    (!previous.startsWith("v") || !stableVersion(previous.slice(1)))
  ) {
    throw new Error(
      "Previous published release must have a stable v<version> tag."
    )
  }
  return previous
}

function main() {
  const { name, version } = read("package.json")
  if (name !== PACKAGE_NAME) throw new Error("Unexpected package name.")
  const changelog = read("CHANGELOG.json")
  validateMetadata(version, changelog, read("package-lock.json"))
  const mode = process.argv[2]
  if (mode === "metadata") return
  if (mode === "tag") {
    git(
      "merge-base",
      "--is-ancestor",
      "HEAD",
      "refs/remotes/origin/" + process.env.DEFAULT_BRANCH
    )
    createTag(git, version, process.env.BUMP_BRANCH)
    return
  }
  if (mode !== "notes") throw new Error("Expected metadata, tag, or notes.")
  const tag = process.env.RELEASE_TAG
  validateTag(git, tag, version, process.env.DEFAULT_BRANCH)
  const releases = getReleases()
  const completed = releases.some(
    release => release.tag_name === tag && !release.draft
  )
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `tag=${tag}\ncompleted=${completed}\n`
  )
  if (completed) {
    console.log("GitHub release is already public; nothing to do.")
    return
  }
  const previous = previousRelease(releases, tag)
  if (previous) git("merge-base", "--is-ancestor", previous, "HEAD")
  fs.writeFileSync(
    path.join(process.env.RUNNER_TEMP, "release-notes.md"),
    releaseNotes(changelog, version, previous?.slice(1))
  )
}

module.exports = {
  PACKAGE_NAME,
  RELEASE_PREFIX,
  stableVersion,
  validateMetadata,
  releaseNotes,
  createTag,
  validateTag,
  previousRelease,
  getReleases,
  run
}
if (require.main === module) main()
