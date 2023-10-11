#!/bin/bash
set -eu

# Configuration
REPO="Superdevs-Recruiting/Fullstack-Challenge-DawidS"
TOKEN="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"
ARTIFACT_NAME="frontend-coverage-report"

# Fetch the ID of the most recent successful workflow run for the main branch
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/actions/runs?branch=main&status=success&event=push")
RUN_ID=$(echo "$RESPONSE" | jq '.workflow_runs[0].id')
echo "RUN_ID: $RUN_ID"

# Fetch the download URL for the artifact named "frontend-coverage-report"
ARTIFACT_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/actions/runs/${RUN_ID}/artifacts")
ARTIFACT_EXISTS=$(echo "$ARTIFACT_RESPONSE" | jq ".artifacts[]? | select(.name == \"$ARTIFACT_NAME\") | .name")

# If the artifact exists, download and extract it
if [ "$ARTIFACT_EXISTS" == "$ARTIFACT_NAME" ]; then
    ARTIFACT_URL=$(echo "$ARTIFACT_RESPONSE" | jq -r ".artifacts[]? | select(.name == \"$ARTIFACT_NAME\") | .archive_download_url")
    echo "ARTIFACT_URL: $ARTIFACT_URL"
    curl -L -o "artifact.zip" -H "Authorization: token $TOKEN" "$ARTIFACT_URL"
    echo A | unzip artifact.zip -d ./
    mv ./coverage/lcov-report ./previous-lcov-report
    rm artifact.zip
else
    echo "No previous artifact found. Proceeding without it..."
fi

# Ensure a previous coverage report exists, if not create an empty one
if [ ! -d previous-lcov-report ]; then
    mkdir previous-lcov-report
fi

# Navigate to the appropriate directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/.. # make sure to adjust this path to your frontend directory

# Run tests and generate a current report
npm test -- --coverage

# Compare the current coverage report with the previous one
# (You'll need a separate script/tool to do this. One option is to use diff or a dedicated coverage comparison tool)
diff -rq coverage/lcov-report previous-lcov-report

# Remove the previous coverage directory as there is no need to keep it
rm -rf previous-lcov-report
