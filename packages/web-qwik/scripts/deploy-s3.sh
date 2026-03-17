#!/bin/bash

set -eu -o pipefail

if [ -z "$STAGE_NAME" ]; then
    echo "STAGE_NAME is not set"
    exit 1
fi

S3_BUCKET="${STAGE_NAME}-46ki75-web-s3-bucket-web"

aws s3 sync ./dist s3://${S3_BUCKET} --delete \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=2592000, s-maxage=31536000, immutable"
