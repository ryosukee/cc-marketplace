#!/bin/bash
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "$0")/../../lib/seed.sh"

seed_repo
seed_ready_pr
seed_question_comment
seed_no_approve_label
seed_finish
