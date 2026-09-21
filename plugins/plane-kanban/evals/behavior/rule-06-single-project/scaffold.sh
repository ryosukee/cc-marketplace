#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/../../lib/seed.sh"

seed_configured_repo

jq -c '. + [{"id":"p-other","name":"other-repo","identifier":"OT"}]' .fake-plane/projects.json > .fake-plane/projects.tmp
mv .fake-plane/projects.tmp .fake-plane/projects.json
