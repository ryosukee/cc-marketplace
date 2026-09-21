#!/bin/bash
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "$0")/../../lib/seed.sh"

seed_repo
seed_conflict_branch
seed_finish
