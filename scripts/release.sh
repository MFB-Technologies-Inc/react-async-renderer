#!/usr/bin/env bash
# Copyright MFB Technologies, Inc.

echo "Changing directory to repo root..."
TIMESTAMP=$(date +'%Y-%m-%d-%H-%M-%S')
TAG_NAME="release-$TIMESTAMP"
PROJECT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REPO_DIR="$( cd -- $PROJECT_DIR && cd -- "$(git rev-parse --show-cdup)" &> /dev/null && pwd)"
cd $REPO_DIR

echo "Fetching origin..."
git fetch origin

# echo "Checking out main..."
# git checkout main
# if [ $? -ne 0 ]; then
#   echo "Failed to checkout the main branch."
#   exit 1
# fi

# echo "Cleaning main..."
# git clean -dfx

# # incase any commits are hanging around in local main (could happen from a previous run that 
# # failed) or remote main has commits that need to be pulled down
# echo "Reset local main to origin main..."
# git reset --hard origin/main
# if [ $? -ne 0 ]; then
#   echo "Failed to hard reset the main branch."
#   exit 1
# fi

# echo "Bumping versions and creating changelogs..."
# npm install
# npx ccg publish --apply

# echo "Committing changes..."
# git status --short
# git add --all
# git commit -m "release ${TAG_NAME}: update changelogs, bump version, run rush update"

# echo "Creating sprint release tag..."
# git tag $TAG_NAME -a -m "Sprint release ${TAG_NAME} ."

# echo "Pushing commit to origin..."
# git push -f
# if [ $? -ne 0 ]; then
#   echo "Failed to push changes to main."
#   exit 1
# fi

# echo "Pushing tag to origin..."
# git push origin $TAG_NAME -f
# if [ $? -ne 0 ]; then
#   echo "Failed to push the sprint release tag to origin."
#   exit 1
# fi

echo "Script ran successfully"