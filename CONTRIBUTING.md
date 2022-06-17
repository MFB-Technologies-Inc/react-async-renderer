# Contributing to React Async Renderer

## Publishing

1. Create a new branch with change log updates and a version bump under the `release/` namespace (e.g. `release/v1.2.1`).
2. Create a pull request and merge that new branch into the `main` branch.
3. [Publish a new Github release](https://docs.github.com/en/enterprise-cloud@latest/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) with a new release tag off of the merge commit of your release. Use the format `v<package.json version number>`, e.g. v1.2.1.
4. Use the GitHub tool to generate the release notes.
5. Rename "Full Changelog" to "Commit Changelog".
6. On a new line, add "**Full Changelog**: `https://github.com/MFB-Technologies-Inc/react-async-renderer/blob/<new tag>/CHANGELOG.md`", replacing `<new tag>` with the tag for this release.
7. Select "Publish release".

> Publishing a new Github release will trigger the publish Github action, which publishes the new release to NPM.
