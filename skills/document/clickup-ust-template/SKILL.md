---
name: clickup-ust-template
description: >-
  Cria e preenche tarefas ClickUp no padrão UST (User Story): sete campos com nomes fixos, formato de payload em clickup-template.md, catálogo Código da UST em codigo-ust-catalog.json, sync-fields.mjs para criar CFs na lista, valores dropdown por UUID de opção e datas em Unix ms. Task template: GET/POST API ou Guardar como modelo na UI. Usa ao importar Markdown/Obsidian ou ao alinhar ao padrão UST/Mútua.
---

# ClickUp — padrão UST (Modelo User Story)

## Quando usar

- Criar ou atualizar **tarefas** numa lista que deve ter os **sete campos UST** e preenchê-los pela API.
- Garantir que a **lista** tem os campos criados (`sync-fields.mjs` ou `POST /list/.../field`) antes de `POST /list/.../task`.
- O utilizador menciona **UST**, **Modelo User Story**, **Código da UST**, ou integração com a skill de **gestão de projeto** deste repo.

## Pré-requisitos

- `CLICKUP_API_TOKEN` — formato `pk_...`.
- `team_id`, `list_id` (e se necessário `space_id`) para chamadas API.
- Nunca commitar o token.

## Nomes dos campos (obrigatório)

Criar ou esperar estes **sete** campos na lista (nomes **exatos**):

1. Complexidade da UST — `number`
2. Código da UST — `drop_down` (catálogo em `scripts/codigo-ust-catalog.json`)
3. Fechado em — `date`
4. Quantidade de USTs — `number`
5. Status da documentação — `drop_down` (Feito, Pendente)
6. Status do faturamento — `drop_down` (A faturar, Faturado)
7. Valor da UST — `number`

**Formato completo dos payloads** (corpo da tarefa com `custom_fields`, exemplos JSON, endpoints, _task template_, MCP): **[clickup-template.md](./clickup-template.md)** — é a referência única para o agente.

## Fluxo resumido

1. **Lista:** `GET /team/.../space` → `GET /space/.../list` → `list_id`.
2. **Campos:** `GET /list/{list_id}/field`. Se faltar algo, `POST /list/{list_id}/field` (corpos em `clickup-template.md`) ou `node scripts/sync-fields.mjs` com `CLICKUP_API_TOKEN` e `CLICKUP_LIST_ID`.
3. **Catálogo “Código da UST”:** comparar número de opções com `codigo_ust_options` no JSON; regras em `clickup-template.md` secção 1.
4. **Tarefa:** `POST /list/{list_id}/task` com `name`, `markdown_description`, `custom_fields` — **IDs sempre do passo 2** na **mesma** lista.
5. **Modelo ClickUp (_template_):** listar com `GET /team/{team_id}/taskTemplate`; instanciar com `POST /list/.../taskTemplate/{template_id}`; criar **novo** modelo na **UI** (“Guardar como modelo”) — detalhes em `clickup-template.md` secção 2.

## Integração com import Markdown

- Mapear `.md` para chaves (`complexidade_ust`, `codigo_ust`, …) e depois para `field_id` / UUIDs de opção obtidos em `GET /list/.../field`.

## Scripts

| Script                                      | Função                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `scripts/sync-fields.mjs`                   | Verifica os 7 campos; compara **Código da UST** com o JSON; só faz `POST` do que faltar.                                             |
| `scripts/Sync-UserStoryFieldsToList.ps1`    | (Opcional Windows) Chama o mesmo fluxo via `node sync-fields.mjs`; executar a partir de `scripts/` ou com caminho completo.          |
| `scripts/sync-user-story-fields-to-list.sh` | (Opcional Linux/macOS/Git Bash) Igual ao `.ps1`: exporta env e corre `node sync-fields.mjs` na skill instalada em `.cursor/skills/`. |

```bash
set CLICKUP_API_TOKEN=pk_...
set CLICKUP_LIST_ID=123456789
node .cursor/skills/clickup-ust-template/scripts/sync-fields.mjs
```

Linux/macOS (skill instalada; `chmod +x` no `.sh` se necessário):

```bash
export CLICKUP_API_TOKEN='pk_...'
./.cursor/skills/clickup-ust-template/scripts/sync-user-story-fields-to-list.sh 901322345272
```

## Dado JSON

- **`scripts/codigo-ust-catalog.json`** — apenas `codigo_ust_options` (nome, cor, ordem por opção). Os outros seis campos estão em `clickup-template.md` e no `sync-fields.mjs`.

**Não** versionar na skill: IDs de workspace nem `template_id` — obtidos com `GET` em runtime.

## Conteúdo da skill (tudo o necessário)

| Ficheiro                                                                                 | Conteúdo                                                                                     |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [clickup-template.md](./clickup-template.md)                                             | Referência API: campos, payloads, exemplo `POST /task`, templates, IDs, MCP, links oficiais. |
| [scripts/sync-fields.mjs](./scripts/sync-fields.mjs)                                     | Cria/verifica os 7 CFs na lista.                                                             |
| [scripts/codigo-ust-catalog.json](./scripts/codigo-ust-catalog.json)                     | Catálogo `codigo_ust_options`.                                                               |
| [scripts/Sync-UserStoryFieldsToList.ps1](./scripts/Sync-UserStoryFieldsToList.ps1)       | Opcional: mesmo fluxo que `sync-fields.mjs` no Windows.                                      |
| [scripts/sync-user-story-fields-to-list.sh](./scripts/sync-user-story-fields-to-list.sh) | Opcional: mesmo fluxo em Linux/macOS/Git Bash.                                               |
