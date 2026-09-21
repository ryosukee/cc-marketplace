#!/bin/bash
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "$0")/../../lib/seed.sh"

seed_repo
seed_no_diff_branch
seed_finish
