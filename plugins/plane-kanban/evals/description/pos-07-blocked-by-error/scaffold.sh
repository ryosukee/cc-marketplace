#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/../../lib/seed.sh"

seed_git_repo
seed_project_config
seed_plane_state
seed_work_items
