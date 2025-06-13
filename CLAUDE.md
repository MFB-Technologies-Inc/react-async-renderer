# CLAUDE.md

@./LLM_INSTRUCTIONS.md

## Azure DevOps Configuration

- Organization: https://dev.azure.com/MFBTech
- Project: Syzygy Web App
- Repository: align-ts
- Default target branch for PRs: develop
- If the user is not logged in remind them to install Azure CLI tools and login using `az login`

## Claude Commit Messages

- Commit messages should not have attribution or emoticons
- Commit messages should be short and preceded by the name of the package to which they relate in square brackets []
    - Example: '[align-client-api] update types to reflect new server respond on binders endpoint'
- If commits do not relate to a particular package or relate to more than one, they should omit the package name and square brackets
    - Example: 'Update all change files'
    - Example: 'Merge changes from origin/develop and resolve conflicts'

## Pull Requests

- Use the Azure CLI tool (and NOT the Github CLI tool) if you are asked to do tasks related to PRs
- When creating a PR: (1) provide a concise description of the purpose of the PR and how it modifies the codebase, (2) do NOT provide a list of every file that has changed, (3) do NOT provide a testing plan or other instructions for the reviewer
