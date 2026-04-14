# ClickUp via MCP — configuração e push a partir de Markdown

Este guia complementa a skill **project-manager**. O agente **deve** ler os **descritores/schema** das ferramentas MCP expostas no **projeto atual** antes de cada chamada (nomes e parâmetros podem variar conforme a versão do servidor).

## Pré-requisito: servidor MCP no Cursor

1. O utilizador precisa de um servidor MCP ClickUp **ativo** na configuração do Cursor (ex.: ficheiro **`.cursor/mcp.json`** no utilizador ou nas definições do projeto, conforme a documentação do produto).
2. **Nunca** colocar tokens, PATs ou chaves API em ficheiros **versionados** do repositório de trabalho. Use apenas configuração local do IDE ou mecanismos de segredos suportados pelo Cursor.

### Exemplo estrutural — MCP remoto HTTP (formato análogo a outros servidores)

A estrutura segue o padrão de entradas com `type`, `url` e `headers` (ex.: `Authorization` com Bearer). **Substitua** `url` e o token pelo que o **fornecedor do seu pack ClickUp** indicar.

**Referências:**

- [ClickUp's MCP Server](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server)
- [MCP Server Setup Instructions](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server-1)

```json
{
  "mcpServers": {
    "clickup": {
      "type": "http",
      "url": "https://example-clickup-mcp-endpoint.example.com/mcp",
      "headers": {
        "Authorization": "Bearer <SEU_TOKEN_AQUI>"
      }
    }
  }
}
```

- `<SEU_TOKEN_AQUI>` é **placeholder**: o valor real fica só na máquina do utilizador.
- O nome da chave (`clickup`, `user-clickup`, etc.) é o **identificador do servidor**; o agente deve descobrir qual está disponível no ambiente.

### Variante — MCP stdio (processo local)

Muitos packs usam `command` + `args` + `env` em vez de `url`:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["-y", "@exemplo/clickup-mcp"],
      "env": {
        "CLICKUP_API_KEY": "<NUNCA_COMMITAR>"
      }
    }
  }
}
```

Consulte a documentação do pack ClickUp que instalou para os valores exactos.

---

## Ferramentas típicas (nomes de referência)

Os nomes abaixo correspondem a um servidor ClickUp MCP comum; **confirme** no descritor local antes de invocar.

| Ferramenta (referência)       | Uso principal                                                  |
| ----------------------------- | -------------------------------------------------------------- |
| `clickup_get_task`            | Ler task remota (título, estado, subtasks, lista).             |
| `clickup_update_task`         | Atualizar nome, descrição/markdown, `status`, `custom_fields`. |
| `clickup_create_task_comment` | Publicar comentário (resumo do trabalho, links, checklist).    |
| `clickup_create_task`         | Criar task nova (só após **gate humano** com lista/space).     |
| `clickup_get_custom_fields`   | Resolver IDs de campos personalizados (ex.: UST).              |
| `clickup_search`              | Localizar `task_id` por nome quando necessário.                |

---

## Fluxo mínimo: `pm-push-clickup` / push pós-trabalho

**Objetivo:** refletir no ClickUp o que está documentado ou concluído no Markdown em `docs/project-manager/**`, **sem** alterar o repositório como fonte da verdade em caso de falha remota.

1. **Ler** o ficheiro `.md` alvo (Task ou Subtask) no repositório.
2. **Resolver identificadores:** `clickup_task_id`, `clickup_workspace_id` e/ou `clickup_url` no **frontmatter** do `.md` em `docs/project-manager/**` (quando o projeto os usar). Se faltar ID, **não** inventar: pedir ao utilizador ou usar `clickup_search` com critérios explícitos.
3. **Parse de URL** (se o utilizador colar link `app.clickup.com`): extrair `task_id` (e `workspace_id` se existir no path); padrões variam — validar com o utilizador se ambíguo.
4. **`clickup_get_task`:** obter estado atual e validar que a task existe. Ver **[Conflitos com o remoto]** abaixo se a descrição ou comentários não corresponderem ao Markdown local.
5. **Propor alterações** ao utilizador: `status`, trecho de `markdown_description` ou resumo, texto de **comentário** (o que foi feito, PRs, critérios), e **custom fields** (UST) se `ust_code` / quantidades estiverem no frontmatter.
6. **Gate humano:** o utilizador **confirma** explicitamente antes de **qualquer** escrita remota.
7. **Executar:** `clickup_update_task` e/ou `clickup_create_task_comment`; para UST, primeiro `clickup_get_custom_fields` para mapear `id` dos campos.
8. **Opcional:** após sucesso, o utilizador pode pedir para gravar `clickup_url` ou IDs no frontmatter local — só se política do projeto o permitir.

### Conflitos com o remoto (descrição e comentários)

Depois de `clickup_get_task`, comparar o remoto com o `.md` local:

- Se a **descrição** (`markdown_description` ou equivalente) no ClickUp tiver conteúdo **reconhecivelmente diferente** do corpo da nota local e **não** for apenas formatação trivial: **não** sobrescrever a descrição remota por defeito.
- **Política predefinida:** **anexar** a síntese do trabalho / briefing / estado como **novo comentário** (`clickup_create_task_comment`). Incluir no gate humano um resumo do que seria publicado e, se aplicável, a menção de que há divergência com a descrição remota.
- **Sobrescrever** a descrição no ClickUp com o texto derivado do repositório só após **confirmação explícita** do utilizador de que o **repositório passa a ser a fonte da verdade** para aquele campo (ou que a descrição remota obsoleta pode ser substituída).
- **Comentários** existentes no remoto: **nunca** apagar nem editar em massa sem instrução explícita; acrescentar novos comentários para progresso, briefings e sincronização incremental.
- Atualizações frequentes de estado: preferir **comentário**; reservar alteração estrutural da **descrição** a alinhamentos pontuais acordados.

### Regras

- **Nunca** escrita remota sem confirmação explícita.
- Falha de rede/MCP/permisões: **registar** o erro; **não** sobrescrever nem “corrigir” o Markdown remoto como verdade.
- **Privacidade:** não enviar segredos, credenciais ou dados pessoais desnecessários em descrições ou comentários.

---

## `pm-sync-clickup` (sync pontual)

**`pm-sync-clickup`:** atualizar **status** e/ou **comentário** a partir de um `.md` já ligado a uma task remota, com o mesmo **gate humano**; o repositório continua fonte da verdade se o MCP falhar.

---

## Import desde ClickUp (prioridade secundária)

Quando o utilizador fornecer URL ou ID: ler task via MCP, decidir hierarquia (task única vs Task + Subtasks em Markdown), confirmar com o utilizador, depois usar os comandos `pm-new-*` da skill. Se a leitura MCP falhar, **não** inventar subtasks — seguir o modelo de campos e import/sync descritos no `SKILL.md` e neste ficheiro.
