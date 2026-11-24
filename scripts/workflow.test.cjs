const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const PUBLISH_WORKFLOW = path.join(
  __dirname,
  "..",
  ".github",
  "workflows",
  "publish.yml"
)
const PUBLISH_COMMAND = "node scripts/publish.cjs"
const OVERRIDDEN_VARIABLE = /\bGITHUB_(REF|SHA)=/

function workflowLines() {
  return fs.readFileSync(PUBLISH_WORKFLOW, "utf8").split("\n")
}

test("publish workflow never overrides GITHUB_REF or GITHUB_SHA, which npm provenance checks against the OIDC certificate", () => {
  const overrides = workflowLines().filter(line =>
    OVERRIDDEN_VARIABLE.test(line)
  )
  assert.deepEqual(overrides, [])
})

test("publish workflow runs the publish script without env-var prefixes", () => {
  const invocations = workflowLines()
    .map(line => line.trim())
    .filter(line => line.includes(PUBLISH_COMMAND))
  assert.ok(invocations.length > 0, "publish.yml must run the publish script")
  invocations.forEach(line => assert.equal(line, PUBLISH_COMMAND))
})
