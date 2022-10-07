# Docker

Run these commands to setup the dev env, which is a copy of the local repo as-is in a volume and a container attached to that volume:

1. `docker build --tag mfbtech-react-async-renderer-dev-env .`
1. `docker run --name mfbtech-react-async-renderer-dev-env -td mfbtech-react-async-renderer-dev-env`

Now attach to the container using vscode and the remote explorer extension.

>
> Deleting the container will delete the volume as well, so make sure you have all of your work pushed before deleting the container.
>
