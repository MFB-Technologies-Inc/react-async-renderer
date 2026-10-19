const { test } = require("node:test")
const assert = require("node:assert/strict")
const { PACKAGE_NAME } = require("./release.cjs")
const {
  integrity,
  registryIntegrity,
  publishArtifact
} = require("./publish.cjs")

function publication(options = {}) {
  const calls = []
  let existing = options.existing ?? null
  const digest = integrity(Buffer.from("release tarball"))
  return {
    calls,
    args: {
      digest,
      lookup: async () => {
        calls.push("lookup")
        if (options.lookupFails) throw new Error("network")
        return existing
      },
      upload: async () => {
        calls.push("upload")
        if (options.uploadFails) throw new Error("upload")
      },
      publish: async () => {
        calls.push("publish")
        if (options.publishFails) throw new Error("publish")
        existing = digest
      },
      finalize: async () => {
        calls.push("finalize")
        if (options.finalizeFails) throw new Error("finalize")
      }
    }
  }
}

test("uploads the artifact before npm and finalizes only after verifying npm integrity", async () => {
  const { calls, args } = publication()
  await publishArtifact(args)
  assert.deepEqual(calls, ["lookup", "upload", "publish", "lookup", "finalize"])
})

test("publication failures leave GitHub unpublished", async () => {
  for (const flag of ["lookupFails", "uploadFails", "publishFails"]) {
    const { calls, args } = publication({ [flag]: true })
    await assert.rejects(publishArtifact(args))
    assert.ok(!calls.includes("finalize"))
    if (flag !== "publishFails") assert.ok(!calls.includes("publish"))
  }
})

test("recovery after GitHub finalization failure skips an existing npm version", async () => {
  const first = publication({ finalizeFails: true })
  await assert.rejects(publishArtifact(first.args), /finalize/)
  const retry = publication({ existing: first.args.digest })
  await publishArtifact(retry.args)
  assert.deepEqual(retry.calls, ["lookup", "upload", "lookup", "finalize"])
})

test("conflicting npm integrity blocks any release mutation", async () => {
  const { calls, args } = publication({
    existing: integrity(Buffer.from("another artifact"))
  })
  await assert.rejects(publishArtifact(args), /different artifact integrity/)
  assert.deepEqual(calls, ["lookup"])
})

test("registry propagation or unexpected integrity prevents GitHub finalization", async () => {
  const { calls, args } = publication()
  args.lookup = async () => null
  await assert.rejects(publishArtifact(args), /does not match/)
  assert.ok(!calls.includes("finalize"))
})

test("registry lookup only treats HTTP 404 as an absent version", async () => {
  assert.equal(
    await registryIntegrity("2.2.3", async () => ({ status: 404 })),
    null
  )
  for (const status of [401, 403, 429, 500]) {
    await assert.rejects(
      registryIntegrity("2.2.3", async () => ({ status, ok: false })),
      /lookup failed/
    )
  }
  await assert.rejects(
    registryIntegrity("2.2.3", async () => {
      throw new Error("network")
    }),
    /network/
  )
  await assert.rejects(
    registryIntegrity("2.2.3", async () => ({
      ok: true,
      json: async () => ({})
    })),
    /invalid package/
  )
  assert.equal(
    await registryIntegrity("2.2.3", async url => {
      assert.equal(
        url,
        "https://registry.npmjs.org/%40mfbtech%2Freact-async-renderer/2.2.3"
      )
      return {
        ok: true,
        json: async () => ({
          name: PACKAGE_NAME,
          version: "2.2.3",
          dist: { integrity: "sha512-test" }
        })
      }
    }),
    "sha512-test"
  )
})

test("draft recovery preserves identical bytes and rejects replacement or unexpected assets", () => {
  const fs = require("node:fs")
  const os = require("node:os")
  const path = require("node:path")
  const { verifyDraftArtifact } = require("./publish.cjs")
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "draft-test-"))
  const filename = "release.tgz"
  const artifact = path.join(directory, filename)
  fs.writeFileSync(artifact, "original tarball")
  const download = contents => (command, args) => {
    assert.equal(command, "gh")
    assert.deepEqual(args.slice(0, 3), ["release", "download", "v1.0.0"])
    fs.writeFileSync(
      path.join(args[args.indexOf("--dir") + 1], filename),
      contents
    )
  }
  try {
    assert.equal(
      verifyDraftArtifact(
        artifact,
        [{ name: filename }],
        "v1.0.0",
        download("original tarball")
      ),
      integrity(Buffer.from("original tarball"))
    )
    assert.throws(
      () =>
        verifyDraftArtifact(
          artifact,
          [{ name: filename }],
          "v1.0.0",
          download("conflicting tarball")
        ),
      /differs/
    )
    assert.equal(fs.readFileSync(artifact, "utf8"), "original tarball")
    assert.throws(
      () => verifyDraftArtifact(artifact, [{ name: "other.tgz" }], "v1.0.0"),
      /Unexpected/
    )
    assert.throws(
      () =>
        verifyDraftArtifact(
          artifact,
          [{ name: filename }, { name: filename }],
          "v1.0.0"
        ),
      /Unexpected/
    )
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
