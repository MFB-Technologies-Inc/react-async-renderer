FROM debian:bullseye-slim AS base-with-deps
ARG USERNAME=vscode
RUN apt-get update && apt-get upgrade -y && apt-get install -y curl git sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
    && useradd -ms /bin/bash -u 1002 -G sudo $USERNAME
WORKDIR /home/$USERNAME
USER $USERNAME
SHELL ["/bin/bash", "--login", "-c"]
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm install --lts=hydrogen \
    && npm install -g npm@9.1.3

# copy local repo into a volume
FROM base-with-deps AS mfbtech-react-async-renderer-dev-env
RUN mkdir /home/$USERNAME/workspace
COPY --chown=$USERNAME:$USERNAME . /home/$USERNAME/workspace
VOLUME /home/$USERNAME/workspace