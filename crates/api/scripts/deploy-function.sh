#!/bin/bash

set -u -e -o pipefail

POLLING_INTERVAL=3

if [ $# -lt 2 ]; then
    printf "\nUsage:\n    $0 <directory-path> <function-name> [alias-name]\n"
    printf "\nExample 1:\n    $0 ./dist my-function\n"
    printf "\nExample 2:\n    $0 ./dist my-function my-alias\n"
    exit 1
fi

DIST_DIR="$1"
FUNCTION_NAME="$2"
ALIAS_NAME="${3:-}"

TEMP_DIR=$(mktemp -d)

echo "Created temporary directory: $TEMP_DIR"
trap 'rm -rf $TEMP_DIR' EXIT

ARCHIVE_PATH="$TEMP_DIR/lambda.zip"

(cd $DIST_DIR && zip -r $ARCHIVE_PATH .)

aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://$ARCHIVE_PATH \
    >/dev/null

echo "Waiting for deployment to complete..."

while true; do
    DEPLOY_STATUS=$(aws lambda get-function \
        --function-name $FUNCTION_NAME \
        --output text \
        --query "Configuration.LastUpdateStatus")

    echo "Current deployment status: $DEPLOY_STATUS"

    if [[ "$DEPLOY_STATUS" == "Successful" ]]; then
        echo "Deployment successful!"
        break
    elif [[ "$DEPLOY_STATUS" == "Failed" ]]; then
        echo "Deployment failed!"
        exit 1
    fi

    sleep $POLLING_INTERVAL
done

FUNCTION_VERSION_NUMBER=$(
    aws lambda publish-version \
        --function-name $FUNCTION_NAME \
        --description "Deployed at $(date)" \
        --output text \
        --query "Version"
)

echo "Published new version: $FUNCTION_VERSION_NUMBER"

if [ -n "$ALIAS_NAME" ]; then
    aws lambda update-alias \
        --function-name $FUNCTION_NAME \
        --name $ALIAS_NAME \
        >/dev/null

    echo "Alias $ALIAS_NAME updated to point to version $FUNCTION_VERSION_NUMBER"
fi
