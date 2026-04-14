# Referência: padrão UST / Modelo User Story (ClickUp API v2)

Documento único de apoio à skill **clickup-ust-template**: campos, formatos de payload, endpoints e uso de **task template**. O agente deve usar **só** este ficheiro + `SKILL.md` + `scripts/codigo-ust-catalog.json` (toda a documentação UST ClickUp está na pasta desta skill).

**Base:** catálogo em `scripts/codigo-ust-catalog.json`; os outros seis campos seguem a tabela abaixo e `sync-fields.mjs`.

---

## 1. Campos personalizados — nomes exatos

Os nomes **devem coincidir** com a lista abaixo (incluindo acentos e capitalização).

| Chave lógica (`key`)  | Nome no ClickUp        | Tipo API    | Notas                                                         |
| --------------------- | ---------------------- | ----------- | ------------------------------------------------------------- |
| `complexidade_ust`    | Complexidade da UST    | `number`    | Valor numérico.                                               |
| `codigo_ust`          | Código da UST          | `drop_down` | Catálogo em `codigo-ust-catalog.json` (`codigo_ust_options`). |
| `fechado_em`          | Fechado em             | `date`      | Em tarefas: valor em **ms Unix** via API.                     |
| `quantidade_usts`     | Quantidade de USTs     | `number`    |                                                               |
| `status_documentacao` | Status da documentação | `drop_down` | Opções: **Feito**, **Pendente**.                              |
| `status_faturamento`  | Status do faturamento  | `drop_down` | Opções: **A faturar**, **Faturado**.                          |
| `valor_ust`           | Valor da UST           | `number`    |                                                               |

**Total: 7 campos.**

### Verificação do catálogo “Código da UST”

1. `GET /list/{list_id}/field`.
2. Campo **Código da UST** (`drop_down`).
3. Comparar `len(type_config.options)` com `len(codigo_ust_options)` em `codigo-ust-catalog.json` (ex.: **87**).

| Situação                                 | Ação sugerida                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Campo ausente                            | `POST /list/{list_id}/field` com **todas** as opções de `codigo_ust_options` (sem `id` nas opções).  |
| `opções_destino >= opções_referência`    | Catálogo OK; usar `type_config.options[].id` **desta** lista para preencher tarefas.                 |
| `0 < opções_destino < opções_referência` | Catálogo incompleto — completar na UI ou remover o campo e voltar a sincronizar (`sync-fields.mjs`). |

---

## 2. Endpoints (ordem típica)

Base URL: `https://api.clickup.com/api/v2`

```http
Authorization: {CLICKUP_API_TOKEN}
Content-Type: application/json
```

| Ordem | Método | Caminho                            | Finalidade                                                                                                |
| ----- | ------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A     | `GET`  | `/team/{team_id}/space`            | `space_id`                                                                                                |
| B     | `GET`  | `/space/{space_id}/list`           | `list_id`                                                                                                 |
| C     | `GET`  | `/list/{list_id}/field`            | `field_id`, opções dos dropdowns (**sempre na lista onde vais criar a tarefa**)                           |
| D     | `GET`  | `/team/{team_id}/field`            | Opcional: CFs ao nível workspace                                                                          |
| E     | `GET`  | `/space/{space_id}/field`          | Opcional: CFs ao nível space                                                                              |
| F     | `POST` | `/list/{list_id}/field`            | Criar definição de campo na lista                                                                         |
| G     | `POST` | `/list/{list_id}/task`             | Criar tarefa (`name`, `markdown_description`, `custom_fields`)                                            |
| H     | `GET`  | `/task/{task_id}`                  | Ler tarefa e `custom_fields`                                                                              |
| I     | `POST` | `/task/{task_id}/field/{field_id}` | Definir valor de CF depois de criada ([doc](https://developer.clickup.com/reference/setcustomfieldvalue)) |

### Modelo de tarefa (_task template_) já no workspace

| Método | Caminho                                      | Finalidade                                                |
| ------ | -------------------------------------------- | --------------------------------------------------------- |
| `GET`  | `/team/{team_id}/taskTemplate?page=0`        | Listar modelos (`template_id` tipo `t-...`)               |
| `POST` | `/list/{list_id}/taskTemplate/{template_id}` | Criar **tarefa** a partir do modelo (`{ "name": "..." }`) |

**Criar um novo modelo** (equivalente a “Guardar como modelo” na UI): **não** há endpoint público estável documentado. Fluxo prático: criar uma tarefa com os 7 CFs corretos (via API ou UI) → na UI do ClickUp **Guardar como modelo**. O `template_id` obtido em `GET .../taskTemplate` é **específico do workspace** onde o modelo foi guardado.

---

## 3. Corpos úteis para `POST /list/{list_id}/field`

### Número

```json
{ "name": "Complexidade da UST", "type": "number" }
```

### Data

```json
{ "name": "Fechado em", "type": "date" }
```

### Dropdown (opções **sem** `id` — o servidor gera)

```json
{
  "name": "Status da documentação",
  "type": "drop_down",
  "type_config": {
    "sorting": "manual",
    "new_drop_down": true,
    "options": [
      { "name": "Feito", "color": "#2ecd6f", "orderindex": 0 },
      { "name": "Pendente", "color": "#e50000", "orderindex": 1 }
    ]
  }
}
```

Para **Código da UST**, usar o array completo `codigo_ust_options` de `codigo-ust-catalog.json` (sem copiar `id`).

---

## 4. Valores em `custom_fields` na tarefa

Cada item: `{ "id": "<field_uuid>", "value": <tipo> }`. Os `id` vêm de **C** (`GET /list/{list_id}/field`) na **mesma** lista.

| Tipo campo  | Valor `value`                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------- |
| `number`    | número JSON                                                                                   |
| `drop_down` | string com **UUID da opção** (`type_config.options[].id` no destino)                          |
| `date`      | **inteiro**, milissegundos Unix (evitar `YYYY-MM-DD` no create se a API devolver `FIELD_017`) |

### Exemplo de corpo `POST /list/{list_id}/task`

Substituir cada `<uuid_...>` pelos valores devolvidos por `GET /list/{list_id}/field` **nessa** lista:

```json
{
  "name": "[UST] Exemplo de título",
  "markdown_description": "## Contexto\n\nDescrição em Markdown.",
  "custom_fields": [
    { "id": "<uuid Complexidade da UST>", "value": 5 },
    {
      "id": "<uuid Código da UST>",
      "value": "<uuid da opção escolhida ex. D.1>"
    },
    { "id": "<uuid Fechado em>", "value": 1713091200000 },
    { "id": "<uuid Quantidade de USTs>", "value": 1 },
    {
      "id": "<uuid Status da documentação>",
      "value": "<uuid opção Feito ou Pendente>"
    },
    {
      "id": "<uuid Status do faturamento>",
      "value": "<uuid opção A faturar ou Faturado>"
    },
    { "id": "<uuid Valor da UST>", "value": 100 }
  ]
}
```

Podes omitir chaves de `custom_fields` que não queiras preencher. Alternativa: criar a tarefa só com `name` / `markdown_description` e preencher CFs com **I**.

---

## 5. IDs de campos e opções (uma lista = uma fonte de verdade)

- Todos os `field_id` e IDs de opção de dropdown vêm de `GET /list/{list_id}/field` **na lista onde a tarefa é criada**.
- **Não** assumas que UUIDs de outro `team_id`, outra lista ou export antigo funcionam aqui — volta a fazer **C** e monta o mapa nome → `id` / nome de opção → `option id`.

---

## 6. MCP do Cursor (`user-clickup`)

O servidor MCP neste projeto **não** cobre, em geral:

- listagem de modelos de tarefa (`taskTemplate`);
- criação de tarefa **a partir de** `taskTemplate`.

Para listar modelos, instanciar a partir do modelo ou criar CFs com payloads completos, usa **HTTP direto** à API v2 (token em `Authorization`), p.ex. `Invoke-RestMethod`, `curl` ou `fetch` no script.

---

## 7. Ficheiro de dados na skill

| Ficheiro                          | Uso                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `scripts/codigo-ust-catalog.json` | `codigo_ust_options[]` — catálogo “Código da UST”. Demais campos: secção 1 + `sync-fields.mjs`. |

---

## 8. Integração com import Obsidian → ClickUp

- Garantir campos criados na lista (**F** ou `sync-fields.mjs`) antes de `POST /task`.
- Mapear frontmatter / secções do `.md` para as chaves da secção 1; resolver `field_id` e `option_id` com **C**.
- Preencher `custom_fields` segundo a secção 4.

---

## 9. Links oficiais (ClickUp API v2)

- [Get Task Templates](https://developer.clickup.com/reference/gettasktemplates)
- [Create Task From Template](https://developer.clickup.com/reference/createtaskfromtemplate)
- [Create Task](https://developer.clickup.com/reference/createtask)
- [Get Task](https://developer.clickup.com/reference/gettask)
- [Get List Custom Fields](https://developer.clickup.com/reference/getaccessiblecustomfields)
- [Set Custom Field Value](https://developer.clickup.com/reference/setcustomfieldvalue)
- [Delete Task](https://developer.clickup.com/reference/deletetask)
- [Custom Fields (overview)](https://developer.clickup.com/docs/customfields)
