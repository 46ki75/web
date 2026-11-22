#!/usr/bin/env bash
set +x
set -euo pipefail

if (( $# == 0 )); then
    printf 'Usage: STAGE_NAME=dev|stg|prod %s <command> [arguments...]\n' "$0" >&2
    exit 2
fi

case ${STAGE_NAME:-} in
    dev|stg|prod) ;;
    *) printf 'STAGE_NAME must be dev, stg, or prod\n' >&2; exit 2 ;;
esac

prefix="/${STAGE_NAME}/46ki75/web/ssm/parameter/notion"
get_parameter() {
    local name="$prefix/$1" value
    value=$(aws ssm get-parameter \
        --region "${AWS_REGION:-ap-northeast-1}" \
        --name "$name" \
        --with-decryption \
        --query 'Parameter.Value' \
        --output text \
        --no-cli-pager) || return
    if [[ -z $value || $value == None ]]; then
        printf 'Empty SSM parameter: %s\n' "$name" >&2
        return 1
    fi
    printf '%s' "$value"
}

NOTION_TOKEN=$(get_parameter secret)
NOTION_ARTICLE_DATA_SOURCE_ID=$(get_parameter data_source/id/blog-article-master)
NOTION_TAG_DATA_SOURCE_ID=$(get_parameter data_source/id/blog-tag)
export NOTION_TOKEN NOTION_ARTICLE_DATA_SOURCE_ID NOTION_TAG_DATA_SOURCE_ID

exec "$@"
