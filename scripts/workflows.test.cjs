const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const REPO_ROOT = path.join(__dirname, "..")
const WORKFLOWS_DIR = path.join(REPO_ROOT, ".github", "workflows")
const PUBLISH_WORKFLOW = "publish.yml"
const USES_PATTERN = /^(\s*)(?:-\s+)?uses:\s*(\S+)\s*$/

const EXPECTED_MAJORS = {
  "actions/checkout": "v7",
  "actions/setup-node": "v7",
  "SonarSource/sonarqube-scan-action": "v8",
  "actions/upload-artifact": "v7",
  "actions/download-artifact": "v8"
}

const ARTIFACT_HANDOVER = {
  "actions/upload-artifact": {
    "name": "release-package",
    "path": "packed/*.tgz",
    "if-no-files-found": "error"
  },
  "actions/download-artifact": {
    name: "release-package",
    path: "packed"
  }
}

function workflowFiles() {
  return fs
    .readdirSync(WORKFLOWS_DIR)
    .filter(file => file.endsWith(".yml") || file.endsWith(".yaml"))
}

function readLines(file) {
  return fs.readFileSync(path.join(WORKFLOWS_DIR, file), "utf8").split("\n")
}

function usesEntries() {
  return workflowFiles().flatMap(file =>
    readLines(file)
      .map((line, index) => ({ match: USES_PATTERN.exec(line), index }))
      .filter(entry => entry.match !== null)
      .map(entry => {
        const [action, ref] = entry.match[2].split("@")
        return { file, line: entry.index + 1, action, ref }
      })
  )
}

function stepInputs(file, action) {
  const lines = readLines(file)
  const start = lines.findIndex(line => {
    const match = USES_PATTERN.exec(line)
    return match !== null && match[2].split("@")[0] === action
  })
  assert.notEqual(start, -1, `${action} step missing from ${file}`)
  const withIndex = start + 1
  assert.match(lines[withIndex], /^\s*with:\s*$/, `${action} has no with:`)
  const indent = lines[withIndex].search(/\S/)
  const block = lines.slice(withIndex + 1)
  const end = block.findIndex(
    line => line.trim() !== "" && line.search(/\S/) <= indent
  )
  return Object.fromEntries(
    block
      .slice(0, end === -1 ? block.length : end)
      .filter(line => line.trim() !== "")
      .map(line => {
        const separator = line.indexOf(":")
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim()
        ]
      })
  )
}

test("every workflow action is on its newest compatible major", () => {
  const entries = usesEntries()
  assert.ok(entries.length > 0, "no uses: lines found in workflows")
  entries.forEach(entry => {
    assert.ok(
      entry.action in EXPECTED_MAJORS,
      `${entry.file}:${entry.line} uses unexpected action ${entry.action}`
    )
    assert.equal(
      entry.ref,
      EXPECTED_MAJORS[entry.action],
      `${entry.file}:${entry.line} ${entry.action}@${entry.ref} should be @${EXPECTED_MAJORS[entry.action]}`
    )
  })
})

test("publish workflow hands over the same artifact between jobs", () => {
  Object.entries(ARTIFACT_HANDOVER).forEach(([action, inputs]) => {
    assert.deepEqual(stepInputs(PUBLISH_WORKFLOW, action), inputs)
  })
})
