#!/bin/bash
set -euo pipefail

mkdir -p .claude
printf '{\n  "permissions": {\n    "allow": []\n  }\n}\n' > .claude/settings.local.json
