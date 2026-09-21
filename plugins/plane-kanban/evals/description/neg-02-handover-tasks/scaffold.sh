#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/../../lib/seed.sh"

seed_configured_repo
seed_handover
