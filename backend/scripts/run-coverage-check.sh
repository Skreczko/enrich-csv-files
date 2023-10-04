#!/bin/bash
set -eu

# Configuration
REPO="Superdevs-Recruiting/Fullstack-Challenge-DawidS"
TOKEN="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"
ARTIFACT_NAME="coverage-report"

# Fetch the ID of the most recent successful workflow run for the main branch
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/actions/runs?branch=main&status=success&event=push")
RUN_ID=$(echo "$RESPONSE" | jq '.workflow_runs[0].id')
echo "RUN_ID: $RUN_ID"

# Fetch the download URL for the artifact named "coverage-report"
ARTIFACT_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/actions/runs/${RUN_ID}/artifacts")
ARTIFACT_URL=$(echo "$ARTIFACT_RESPONSE" | jq -r ".artifacts[] | select(.name == \"$ARTIFACT_NAME\") | .archive_download_url")
echo "ARTIFACT_URL: $ARTIFACT_URL"

# Exit if the artifact is not found
if [ "$ARTIFACT_URL" == "null" ] || [ -z "$ARTIFACT_URL" ]; then
    echo "Artifact $ARTIFACT_NAME not found"
    exit 1
fi

# Download and extract the artifact
curl -L -o "artifact.zip" -H "Authorization: token $TOKEN" "$ARTIFACT_URL"
echo A | unzip artifact.zip -d ./
rm artifact.zip

# Navigate to the appropriate directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

# Run tests and generate a coverage report
pytest --cov=. --cov-report=term-missing:skip-covered --cov-report=xml:coverage.xml

# Ensure a previous coverage report exists, if not create an empty one
if [ ! -f previous-coverage.xml ] || [ ! -s previous-coverage.xml ]; then
    echo '<coverage></coverage>' > previous-coverage.xml
fi

# Compare the current coverage report with the previous one
scripts/check_coverage.py coverage.xml previous-coverage.xml

# Remove coverages as there is no need to keep them
#rm -f coverage.xml previous-coverage.xml .coverage
rm -f previous-coverage.xml
