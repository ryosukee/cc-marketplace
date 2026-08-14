#!/bin/bash
set -euo pipefail

mkdir -p .claude-plugin
printf '{\n  "name": "my-marketplace",\n  "plugins": [\n    {"name": "sample", "description": "サソプルの plugin"}\n  ]\n}\n' > .claude-plugin/marketplace.json
