<#
.SYNOPSIS
  Cria na lista ClickUp os sete campos UST delegando em sync-fields.mjs (catálogo
  codigo-ust-catalog.json + definições fixas no script Node).

.PARAMETER ListId
  ID da lista ClickUp onde os campos serão criados.

.PARAMETER Token
  Token API (pk_...). Preferir $env:CLICKUP_API_TOKEN.

.EXAMPLE
  $env:CLICKUP_API_TOKEN = 'pk_...'
  .\Sync-UserStoryFieldsToList.ps1 -ListId '901322345272'
#>
param(
  [Parameter(Mandatory)][string]$ListId,
  [string]$Token = $env:CLICKUP_API_TOKEN
)

if (-not $Token) { throw 'Defina CLICKUP_API_TOKEN ou passe -Token.' }

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')
$nodeScript = Join-Path $repoRoot '.cursor\skills\clickup-ust-template\scripts\sync-fields.mjs'
if (-not (Test-Path -LiteralPath $nodeScript)) {
  throw "Script não encontrado: $nodeScript"
}

$env:CLICKUP_API_TOKEN = $Token
$env:CLICKUP_LIST_ID = $ListId
& node $nodeScript
