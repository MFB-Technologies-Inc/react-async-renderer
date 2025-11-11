# CLAUDE.md

@./LLM_INSTRUCTIONS.md

## Remote Repository Configuration

- Organization: https://github.com/MFB-Technologies-Inc
- Project: react-async-renderer
- Repository: react-async-renderer
- Default target branch for PRs: main

## Claude Commit Messages

- start the commit message with a list of the file paths in the staged changes separated by commas and ending with a colon
- each file in the list should include only the parent folder and not the full path to the file, the linux path separator, the file name and the file's extension.

## Pull Requests

- Use the Github CLI tool if you are asked to do tasks related to PRs
- When creating a PR:

  1. **Title Format**: Use conventional commit format (e.g., `feat: add new feature`, `fix: resolve bug`)
  2. **Reviewers**: Set to `MFB-Technologies-Inc/web-app-devs` team
  3. **Assignment**: Assign to the PR creator
  4. **Body Structure**: Include a "Summary" section with bullet points of changes
  5. **GitHub CLI Command Example**:

    ```bash
     gh pr create --title "fix: describe the change" --body "$(cat <<'EOF'
     ## Summary
     
     - Change 1 description
     - Change 2 description
     - Change 3 description
     EOF
     )" --reviewer "MFB-Technologies-Inc/web-app-devs" --assignee "@me"
    ```
