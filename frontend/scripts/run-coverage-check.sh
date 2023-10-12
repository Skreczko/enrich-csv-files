#!/bin/bash

# Configuration
REPO="Superdevs-Recruiting/Fullstack-Challenge-DawidS"
TOKEN="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"
ARTIFACT_NAME="frontend-coverage-report"

# Fetch the ID of the most recent successful workflow run for the main branch
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/actions/runs?branch=main&status=success&event=push")
RUN_ID=$(echo "$RESPONSE" | jq '.workflow_runs[0].id')
echo "RUN_ID: $RUN_ID"

# Fetch the download URL for the artifact
ARTIFACT_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/actions/runs/${RUN_ID}/artifacts")
ARTIFACT_URL=$(echo "$ARTIFACT_RESPONSE" | jq -r ".artifacts[] | select(.name == \"$ARTIFACT_NAME\") | .archive_download_url")

# Download the artifact
if [ "$ARTIFACT_URL" != "null" ] && [ ! -z "$ARTIFACT_URL" ]; then
    echo "ARTIFACT_URL: $ARTIFACT_URL"
    curl -L -o "artifact.zip" -H "Authorization: token $TOKEN" "$ARTIFACT_URL"
    echo A | unzip artifact.zip -d ./
    mv cobertura-coverage.xml previous-coverage.xml
    rm artifact.zip
else
    echo "No previous artifact found. Creating an empty one..."
    echo '<coverage></coverage>' > previous-coverage.xml
fi

# Navigate to the frontend directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../../frontend

# Run tests and generate a current report in XML format
npm test -- --coverage --coverageReporters=lcov --coverageReporters=text --coverageReporters=cobertura

# Rename the generated XML report to cobertura-coverage.xml in frontend directory
mv coverage/cobertura-coverage.xml ./cobertura-coverage.xml

# Compare the current coverage report with the previous one and remove coverages based on the result
if ! python3 ../backend/scripts/check_coverage.py cobertura-coverage.xml previous-coverage.xml; then
    [ -f previous-coverage.xml ] && rm -f previous-coverage.xml
#    [ -f cobertura-coverage.xml ] && rm -f cobertura-coverage.xml
    rm -rf coverage/
    exit 1
else
    [ -f previous-coverage.xml ] && rm -f previous-coverage.xml
    #    [ -f cobertura-coverage.xml ] && rm -f cobertura-coverage.xml
    rm -rf coverage/
    exit 0
fi