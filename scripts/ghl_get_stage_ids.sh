#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  ghl_get_stage_ids.sh <GHL_PRIVATE_INTEGRATION_TOKEN> <GHL_LOCATION_ID> <GHL_PIPELINE_ID>

Outputs:
  - one line per pipeline stage as:  "<stage_name>,<stage_id>"
  - only for the specified pipeline.

Environment variables (optional overrides):
  - GHL_API_VERSION: overrides Version header (default: 2021-07-28)
USAGE
}

if [[ ${#} -ne 3 ]]; then
  usage
  exit 1
fi

TOKEN=$1
LOCATION_ID=$2
PIPELINE_ID=$3
API_VERSION=${GHL_API_VERSION:-"2021-07-28"}

if [[ -z "$TOKEN" || -z "$LOCATION_ID" || -z "$PIPELINE_ID" ]]; then
  echo "ERROR: token, locationId, and pipelineId are required." >&2
  exit 1
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

url="https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${LOCATION_ID}"

curl -fsS \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Version: ${API_VERSION}" \
  -H 'Accept: application/json' \
  "${url}" \
  | tee "$TMP_FILE"

echo
python3 - "$PIPELINE_ID" "$TMP_FILE" <<'PY'
import json
import sys
from pathlib import Path

pipeline_id = sys.argv[1]
raw = Path(sys.argv[2]).read_text(encoding='utf-8')

try:
    payload = json.loads(raw)
except json.JSONDecodeError as err:
    print(f"ERROR: failed to parse pipeline payload: {err}", file=sys.stderr)
    sys.exit(1)

# API shape is workspace-dependent. Support both top-level arrays and named maps.
pipelines = []
if isinstance(payload, dict):
    pipelines = payload.get('pipelines') or payload.get('data') or payload.get('items') or []
elif isinstance(payload, list):
    pipelines = payload

for pipeline in pipelines:
    if not isinstance(pipeline, dict):
        continue
    if str(pipeline.get('id', '')) != str(pipeline_id):
        continue
    stages = pipeline.get('stages') or []
    if not stages:
        print(f"ERROR: no stages found for pipeline={pipeline_id}", file=sys.stderr)
        sys.exit(1)
    for stage in stages:
        if not isinstance(stage, dict):
            continue
        stage_name = str(stage.get('name') or '').strip() or 'unknown'
        stage_id = str(stage.get('id') or '').strip()
        if not stage_id:
            continue
        print(f"{stage_name},{stage_id}")
    break
else:
    print(f"ERROR: pipeline not found: {pipeline_id}", file=sys.stderr)
    sys.exit(1)
PY
