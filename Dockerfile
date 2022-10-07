FROM node:16-bullseye AS base-with-deps

ARG USERNAME=vscode

# setup the vscode user for the developer
RUN groupadd -r $USERNAME \
    && useradd --no-log-init -rm -d /home/$USERNAME -s /bin/bash -g $USERNAME $USERNAME
USER $USERNAME
WORKDIR /home/$USERNAME

# copy local repo into a volume
FROM base-with-deps AS mfbtech-react-async-renderer-dev-env
RUN mkdir /home/$USERNAME/git
COPY --chown=$USERNAME:$USERNAME . /home/$USERNAME/git
VOLUME /home/$USERNAME/git