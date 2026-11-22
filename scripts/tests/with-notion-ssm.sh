#!/usr/bin/env bash
set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
wrapper="$root/scripts/with-notion-ssm.sh"
scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT

export PATH="$scratch:$PATH"
export TEST_CALLS="$scratch/ssm-calls"
export TEST_STARTED="$scratch/publisher-started"
export TEST_TOKEN='test-token with $literal'
export TEST_REGION=ap-northeast-1
unset AWS_REGION

cat > "$scratch/aws" <<'AWS'
#!/usr/bin/env bash
set -euo pipefail
[[ $# == 12 && $1 == ssm && $2 == get-parameter && $3 == --region && $4 == "$TEST_REGION" && $5 == --name ]]
[[ $7 == --with-decryption && $8 == --query && $9 == Parameter.Value && ${10} == --output && ${11} == text && ${12} == --no-cli-pager ]]
printf '%s\n' "$6" >> "$TEST_CALLS"
case "$6" in
    /stg/46ki75/web/ssm/parameter/notion/secret) printf '%s\n' "$TEST_TOKEN" ;;
    /stg/46ki75/web/ssm/parameter/notion/data_source/id/blog-article-master) printf 'test-articles\n' ;;
    /stg/46ki75/web/ssm/parameter/notion/data_source/id/blog-tag)
        case ${TEST_FAILURE:-} in
            aws) exit 42 ;;
            empty) printf 'None\n' ;;
            *) printf 'test-tags\n' ;;
        esac ;;
    *) exit 44 ;;
esac
AWS
chmod +x "$scratch/aws"

cat > "$scratch/publisher" <<'PUBLISHER'
set -euo pipefail
[[ $# == 1 && $1 == 'publisher argument' ]]
[[ $NOTION_TOKEN == "$TEST_TOKEN" ]]
[[ $NOTION_ARTICLE_DATA_SOURCE_ID == test-articles ]]
[[ $NOTION_TAG_DATA_SOURCE_ID == test-tags ]]
printf 'started\n' > "$TEST_STARTED"
PUBLISHER

if STAGE_NAME=other "$wrapper" bash "$scratch/publisher" 'publisher argument' >"$scratch/output" 2>&1; then
    printf 'Invalid stage was accepted\n' >&2
    exit 1
fi
[[ ! -e $TEST_CALLS && ! -e $TEST_STARTED ]]

STAGE_NAME=stg bash -x "$wrapper" bash "$scratch/publisher" 'publisher argument' >"$scratch/output" 2>&1
[[ -e $TEST_STARTED ]]
[[ $(wc -l < "$TEST_CALLS") -eq 3 ]]
if grep -Fq -- "$TEST_TOKEN" "$scratch/output"; then
    printf 'Wrapper logged the token\n' >&2
    exit 1
fi

rm -- "$TEST_STARTED"
status=0
STAGE_NAME=stg TEST_FAILURE=aws AWS_REGION=us-east-1 TEST_REGION=us-east-1 \
    "$wrapper" bash "$scratch/publisher" 'publisher argument' >"$scratch/output" 2>&1 || status=$?
[[ $status -eq 42 && ! -e $TEST_STARTED ]]

if STAGE_NAME=stg TEST_FAILURE=empty "$wrapper" bash "$scratch/publisher" 'publisher argument' >"$scratch/output" 2>&1; then
    printf 'Empty parameter was accepted\n' >&2
    exit 1
fi
[[ ! -e $TEST_STARTED ]]
grep -Fq 'Empty SSM parameter:' "$scratch/output"
printf 'SSM wrapper tests passed\n'
