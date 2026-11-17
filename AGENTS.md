# AGENTS.md

How AI agents take an issue to a pull request in this repo.

## Workflow

A human developer creates the issue. A separate agent handles each phase, and each phase starts in a clean context. The issue and its comments carry context between phases, so post each phase's output (or a link to it) on the issue.

## Phases

1. **Plan:** Write a dev plan and post it as a comment on the issue.
2. **Test:** Create a branch for the issue (`issue-<number>-<short-description>`). Write tests first (TDD), if applicable.
3. **Implement:** Implement the dev plan.
4. **Review:** Review the code changes and fix any medium or higher findings. Do this once. Don't iterate.
5. **Pull request:** Open a PR. Write the description for a junior dev with zero context, and keep it concise. Title, reviewers and assignee: see `LLM_INSTRUCTIONS.md` (Pull Requests).

## Pull request sections

- What
- Public facing changes
- Changes
- PR review findings (fixed and not fixed)

## Before opening a PR

- `npm run build`, `npm run lint`, `npm run check-formatting`, `npm run typecheck`, and `npm run test:ci` pass.
- Add a change file under `changes/` (`npx ccg change`, or write the JSON by hand); CI checks it with `npx --no-install ccg change --verify`. Use type `NONE` for changes that don't affect users.
