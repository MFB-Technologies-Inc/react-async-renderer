# React Async Renderer

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=mfbtech_Syzygy_Web_App_align-ts_asyncRenderer&metric=alert_status&token=997661041de9f3486f374035a937bda621a25e88)](https://sonarcloud.io/summary/new_code?id=mfbtech_Syzygy_Web_App_align-ts_asyncRenderer)

Utilities for rendering JSX with respect to one or more asynchronous operations.

## Installation

```bash
npm install --save @mfbtech/react-async-renderer
```

## Usage

At the core of this package is `createAsyncRenderer`, which renders specific JSX for a given asynchronous operation.

```tsx
function useMyData() {
  // Setup status state to reflect the state of your long running process
  const [status, setStatus] = useState<AsyncRequestStatus>(AsyncRequestStatusEnum.INIT)
  // Setup error state for any errors associated with your long running process
  const [error, setError] = useState<null | string>(null)
  // Setup data state for any data returned from your long running process
  const [data, setData] = useState<null | string>(null)

  // Logic to kick off a request for data and update local state respectively...

  return {
    status,
    error,
    data
  }
}

function MyDataComponent() {
  const myData = useMyData()
  // Create a renderer for your long running process
  const loadingRenderer = createAsyncRenderer({
    status: myData.status,
    error: myData.error,
    onCompletedSuccessfullyArgs: myData.data
  })

  return loadingRenderer(
    // Render the component with the validated data
    myValidatedData => (
      <div>
        <h1>My Data</h1>
        {myValidatedData}
      </div>
    ), 
    // Optional args that specify UI for specific states in the async operation
    {
      onCompletedWithError: <p>An error has occurred while fetching the data.</p>,
      onLoading: <p>Data is loading...</p>
      onInit: <p>Waiting for the data to be requested.</p>
  })
}
```

You can also use the `AsyncUiModel` with `createAsyncUiModelRenderer` and `composeAsyncUiModel` to simplify the code used in the consumer component.

```tsx
function useMyDataComponentUiModel() {
  const myData = useMyData()
  return composeAsyncUiModel(
    myData.data,
    myData.status,
    myData.error ?? ""
  )
}

function MyDataComponent() {
  const uiModel = useMyDataComponentUiModel()
  const loadingRenderer = createAsyncUiModelRenderer(uiModel)

  return loadingRenderer(
    myValidatedData => (
      <div>
        <h1>My Data</h1>
        {myValidatedData}
      </div>
  ))
}
```

These other utility functions can be used to simplify the logic around `createAsyncRenderer`:

- `rtkqResultsToStatusError`: Used specifically for converting [RTK Query Results](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#signature) to an asynchronous request object that can be used with `createAsyncRenderer`.
- `getCascadedAsyncState`: Reduces a chain of asynchronous request objects down one asynchronous request object.
- `getOptimisticAsyncLoadState`: Converts its arguments into an optimistic asynchronous request object such that if the arguments indicate a pending asynchronous request and a fulfilled asynchronous request, then the result is a fulfilled asynchronous request object.

Checkout the [example application](./example-app/README.md).

## License

[MIT License](./LICENSE)

## Changelog

[Changelog](./CHANGELOG.md)

## Releases

Releases use reviewed version-bump PRs. Start **Actions → version-bump → Run
workflow** on `main`, approve the generated PR's workflow runs if requested, and
merge the reviewed PR using **Create a merge commit**. Tagging and GitHub/npm
publication then run automatically; no separate publication approval is added.

### Repository setup

- For npm package `@mfbtech/react-async-renderer`, configure a GitHub Actions
  **Trusted Publisher** with organization `MFB-Technologies-Inc`, repository
  `react-async-renderer`, and workflow filename `publish.yml`. Enable direct
  `npm publish`. Leave the environment empty: the workflow does not use a GitHub
  environment. Complete the first publish within two days of saving a new trust
  configuration; npm expires unvalidated configurations after that window. See
  [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
- Publishing runs on GitHub-hosted runners using Node 24, npm 11.6.2, and
  `id-token: write`. It uses OIDC, not an npm token, and disables dependency caching
  in release jobs. npm generates provenance for this public repository.
- In **Settings → Actions → General**, allow Actions to create pull requests.
  The bump workflow uses `GITHUB_TOKEN`; GitHub can require a maintainer to select
  **Approve workflows to run** on its PR before required checks run. See
  [GitHub workflow triggering](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).
- Enable merge commits and ensure branch protection permits reviewed release PRs.
  Do not squash/rebase these PRs or merge them with a bot using `GITHUB_TOKEN`:
  publication uses their merge event and validates both merge parents.
- Repository tag rules must allow the workflow to create `v<version>` tags and
  should prevent deleting or updating released tags. The workflow never force-pushes.
- After verifying OIDC publication, remove obsolete `NPM_TOKEN`,
  `RELEASE_PAT_TOKEN`, and `RELEASE_GIT_EMAIL` configuration. Revoke unused tokens
  only after checking whether other repositories still use them.

### Prepare and merge a release

1. Merge changes and their `ccg change` files. At least one PATCH, MINOR, or MAJOR
   entry is required; NONE and DEPENDENCY alone do not increase the version.
2. Dispatch **version-bump** on `main`. It applies the installed, lockfile-pinned
   changelog generator, synchronizes the lockfile, runs checks, and opens
   `release/v<version>`. Only package metadata, changelogs, and consumed change
   files are committed. It does not push changes directly to `main`.
3. Review the generated PR, approve its checks if prompted, and merge with
   **Create a merge commit**. Finish one release PR before starting another.
   If its branch is stale, close the PR and delete the abandoned branch, then
   regenerate it from current `main`; never reuse a released version.
4. **publish** checks the exact merge commit, its ancestry, the version increase,
   branch name, and matching package/lockfile/changelog metadata. It creates
   `v<version>` at that commit. Commit message wording has no effect.
5. That tagged commit is built, tested, and packed in a separate read-only job
   without npm OIDC permission or persisted checkout credentials. Its tarball is
   passed through a workflow artifact to the publishing job, which uploads it to
   a draft GitHub release and publishes the same file to npm with public access.
   Only after npm integrity verification does the GitHub release become public.
   Tag preparation has repository write access but no OIDC permission; only the
   publishing job has both. Neither privileged job installs project dependencies
   or runs build/test scripts. Their isolated, pinned release dependency and npm
   installations disable lifecycle scripts.

`CHANGELOG.json` contains the migrated historical versions and is the generator's
source of truth. Historical dates and comments are preserved; generated Markdown
may normalize headings/spacing. Release notes include every changelog version
since the previous published stable GitHub release, including intermediate bumps
that were never published. Drafts and prereleases are excluded from that boundary;
NONE comments are omitted, as they are in the Markdown changelog. Missing or
inconsistent boundaries stop publication rather than silently omitting changes.

For an isolated local preview, copy the package/changelog/change files into a
scratch checkout, run `npm ci`, and use `npx --no-install ccg publish`. `--apply`
writes the version and changelogs and consumes change files; follow it with
`npm install --package-lock-only --ignore-scripts` and
`node scripts/release.cjs metadata`. This command prepares metadata; it does not
publish a package.

### Recover a failed release

- **Before a PR exists:** fix the reported error and rerun version-bump. If pushing
  succeeded but PR creation failed, create the PR from the existing release branch
  using the usual GitHub UI, or delete that abandoned branch and regenerate. An
  existing open release PR or branch is never overwritten automatically.
- **Before tagging:** fix permissions or metadata and rerun the failed publish
  workflow. Squashed/rebased release PRs cannot be retried as valid merge commits;
  prepare a fresh version-bump PR with a new change file instead.
- **After tagging:** rerun the publish workflow, or dispatch **publish** on `main`
  with the existing tag (for example `v2.2.3`). Manual recovery never creates or
  moves tags. Later commits on `main` do not change which commit is released.
  npm provenance records the checked-out tag and commit while retaining the
  identity of the workflow performing recovery. Recovery applies to tags created
  with this automation; older tags lack its scripts.
- **After a draft upload:** recovery downloads the original artifact and compares
  it with the rebuild. A mismatch stops publication; do not replace an already
  published artifact. Keep release tooling/dependencies fixed when investigating.
- **After npm succeeds:** recovery verifies npm's integrity against the tarball,
  skips publishing the existing version, and finishes GitHub publication. Registry
  errors fail explicitly. If registry propagation delays verification, retry later.
- **Already public:** rerunning a completed release is a no-op. A bad published
  package needs a new change file and version; npm versions and release tags must
  not be rewritten. Recovery refuses to publish an older pending version after a
  newer stable release has become public.

### Release validation and rollout checklist

Run `npm run test:release` for metadata, Git tag/ancestry, changelog migration,
release-note, and mocked publishing/recovery tests. Also run the existing build,
`test:once`, lint, typecheck, formatting, and `check-formatting:release` commands.
Use `npm run package` to inspect the tarball locally; it does not publish.

The following require repository/package administration or an actual release and
must be tracked separately from local test results:

- [ ] Save the npm trusted publisher with direct publishing enabled.
- [ ] Verify Actions PR permissions, required checks, merge-commit settings, and
      version-tag creation/protection rules.
- [ ] Observe the first generated PR and successful automatic publication after merge.
- [ ] Confirm tag/merge SHA, complete release notes, npm provenance, and identical
      npm/GitHub tarball integrity.
- [ ] Verify recovery on a controlled interrupted publication and a completed-run retry.
- [ ] Remove obsolete repository configuration and revoke unused tokens after success.
