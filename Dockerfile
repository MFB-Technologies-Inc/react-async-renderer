FROM debian:bullseye-slim AS base-with-deps
ARG USERNAME=vscode
RUN apt-get update && apt-get upgrade -y && apt-get install -y curl git
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
    && useradd -ms /bin/bash -G sudo $USERNAME
USER $USERNAME
WORKDIR /home/$USERNAME
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm install --lts=hydrogen

# copy local repo into a volume
FROM base-with-deps AS mfbtech-react-async-renderer-dev-env
RUN mkdir /home/$USERNAME/git
COPY --chown=$USERNAME:$USERNAME . /home/$USERNAME/git
VOLUME /home/$USERNAME/git