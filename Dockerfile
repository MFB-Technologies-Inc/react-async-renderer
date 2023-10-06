FROM debian:bookworm
ARG USERNAME=vscode
RUN apt-get update
RUN apt-get -y install git fzf ripgrep curl python3 ssh sudo locales gnupg lsb-release libnss3-tools gstreamer1.0-gl gstreamer1.0-plugins-ugly
# set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
# configure terminal
ENV TERM="xterm-256color"
ADD https://raw.githubusercontent.com/git/git/master/contrib/completion/git-completion.bash .git-completion.bash
ADD https://raw.githubusercontent.com/git/git/master/contrib/completion/git-prompt.sh .git-prompt.sh
COPY docker/bashrc .bashrc
# setup the user for the developer
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
RUN useradd -ms /bin/bash -u 1002 -G sudo $USERNAME
RUN chown -R $USERNAME /home/$USERNAME
WORKDIR /home/$USERNAME
USER $USERNAME
# setup ssh
RUN mkdir -p -m 0700 ~/.ssh
RUN ssh-keyscan github.com >> ~/.ssh/known_hosts
SHELL ["/bin/bash", "--login", "-c"]
# install nvm with a specified version of node
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
&& . ~/.nvm/nvm.sh \
&& nvm install --lts=hydrogen
# clone repo
RUN --mount=type=ssh,uid=1002 git clone git@github.com:MFB-Technologies-Inc/react-async-renderer /home/$USERNAME/workspace/react-async-renderer
# set working dir
WORKDIR /home/$USERNAME/workspace/react-async-renderer
VOLUME /home/$USERNAME/workspace/react-async-renderer
