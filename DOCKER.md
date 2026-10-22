# Docker

1. Generate an SSH key and add it to GitHub.
1. Clone the repository.
1. Run `eval "$(ssh-agent)"`.
1. Run `ssh-add`.
1. Run `docker build --ssh default --pull -t mfb-async-renderer-dev-env .`.
1. Run `docker create --mount type=bind,src=${HOME}/.ssh,target=/home/vscode/.ssh --name mfb-async-renderer-dev-env-active -h mfb-async-renderer-dev-env -it mfb-async-renderer-dev-env`.
1. Install the "Remote Development" extension pack in VS Code.
1. Navigate to Remote Explorer in the VSCode sidebar.
1. Select Containers from the drop down at the top.
1. Attach to the mfb-async-renderer-dev-env-active container.
1. Click Open Folder and open the react-async-renderer folder.

The image uses Node 24 and npm 11.6.2, matching release tooling. This does not change the library's React peer dependencies or TypeScript output target.
