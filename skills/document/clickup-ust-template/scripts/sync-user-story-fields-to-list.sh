#!/usr/bin/env bash
# Cria na lista ClickUp os sete campos UST delegando em sync-fields.mjs (catálogo
# codigo-ust-catalog.json + definições fixas no script Node).
#
# Uso (com a skill instalada em .cursor/skills/clickup-ust-template/):
#   export CLICKUP_API_TOKEN='pk_...'
#   ./sync-user-story-fields-to-list.sh 901322345272
#
#   # ou token como segundo argumento:
#   ./sync-user-story-fields-to-list.sh 901322345272 'pk_...'
#
set -euo pipefail

usage() {
  echo "Uso: $0 <list_id> [token]" >&2
  echo "  token opcional se CLICKUP_API_TOKEN estiver definido." >&2
  exit 1
}

if [[ $# -lt 1 ]] || [[ $# -gt 2 ]]; then
  usage
fi

LIST_ID="$1"
TOKEN="${2:-${CLICKUP_API_TOKEN:-}}"

if [[ -z "$TOKEN" ]]; then
  echo "Defina CLICKUP_API_TOKEN ou passe o token como segundo argumento." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
NODE_SCRIPT="$REPO_ROOT/.cursor/skills/clickup-ust-template/scripts/sync-fields.mjs"

if [[ ! -f "$NODE_SCRIPT" ]]; then
  echo "Script não encontrado: $NODE_SCRIPT" >&2
  exit 1
fi

export CLICKUP_API_TOKEN="$TOKEN"
export CLICKUP_LIST_ID="$LIST_ID"
exec node "$NODE_SCRIPT"
