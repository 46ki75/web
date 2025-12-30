#!/bin/bash

set -eu -o pipefail

FUNCTION_NAME="${STAGE_NAME}-46ki75-web-lambda-function-nitro"
ARTIFACT_PATH="./.output/server/"

TEMPDIR=$(mktemp -d)
trap "rm -rf ${TEMPDIR}" EXIT

cp -r "${ARTIFACT_PATH}"/* "${TEMPDIR}/"

zip -j -r "${TEMPDIR}/lambda.zip" "${TEMPDIR}/"*

aws lambda update-function-code --function-name "${FUNCTION_NAME}" --zip-file "fileb://${TEMPDIR}/lambda.zip" --publish

aws lambda update-aliase --function-name "${FUNCTION_NAME}" --name "stable" --function-version "\$LATEST"

echo "Deployed Lambda function: ${FUNCTION_NAME}"