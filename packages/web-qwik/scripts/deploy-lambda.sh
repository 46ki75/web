#!/bin/bash

set -eu -o pipefail

FUNCTION_NAME="${STAGE_NAME}-46ki75-web-lambda-function-nitro"
ARTIFACT_PATH="./.output/server/"

TEMPDIR=$(mktemp -d)
ZIP_FILE="${TEMPDIR}.zip"
trap 'rm -rf "${TEMPDIR}" "${ZIP_FILE}"' EXIT

cp -r "${ARTIFACT_PATH}"/* "${TEMPDIR}/"

# create zip preserving directory structure to avoid duplicate basenames
( cd "${TEMPDIR}" && zip -r "${ZIP_FILE}" . )

VERSION=$(aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}" \
    --zip-file "fileb://${ZIP_FILE}" \
    --publish \
    --query Version \
    --output text)

aws lambda update-alias \
    --function-name "${FUNCTION_NAME}" \
    --name "stable" \
    --function-version "${VERSION}" > /dev/null

echo "Deployed Lambda function: ${FUNCTION_NAME}"
