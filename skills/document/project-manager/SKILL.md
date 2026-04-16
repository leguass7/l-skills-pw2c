---
name: project-manager
description: Gestão de projeto em Markdown (Obsidian-friendly) com modos Ágil e Completo, fases 1–6, backlog Epic→Story→Task→Subtask (ou modo achatado Mútua com pasta por funcionalidade e USXX - [stack] - …, alinhado à US/Task pai no ClickUp), UST 1:1 por tarefa (MCP + catálogo), títulos ClickUp sem prefixos internos, revisão técnica, briefing pós-Fase 5, glossário, gates de complexidade (in dubio pro-revisio), push/sync ClickUp via MCP. Controlo em docs/project-manager/ apenas (sem docs/specs/). Validação mecânica via l-skills-pw2c pm-lint. O pacote inclui SKILL.md, templates, Exemplo_Estrutura_Achatada e guias — não inclui specs de planeamento do repositório l-skills-pw2c.
---

# SKILL: Project Manager (Markdown + fases + ClickUp MCP)

## [O QUE ESTE PACOTE É — E O QUE NÃO É]

- **É (para o agente):** instruções neste `SKILL.md`, mais ficheiros em **`references/`** — templates (`Template_*`), guias (`Guia_*`, `Boas_Praticas_*`), golden rules (`Company_*_Golden_Rules_Template`), **`references/UST_Catalog.md`**, **`references/Briefing_Execucao_Fase5.md`**, **`references/Template_Glossario.md`**, **`references/Exemplo_Estrutura_Achatada.md`** (modo backlog achatado: pasta por funcionalidade, `USXX - [stack] - …`, US/Task pai ClickUp), **`references/clickup-mcp-push.md`** (MCP ClickUp) e **`references/pm-lint-cli.md`** (comando `l-skills-pw2c pm-lint`).
- **Não é:** cópia das **specs de planeamento** da skill (documentos longos tipo visão, fases completas, modelo ClickUp normativo). Esses vivem **só** no repositório **l-skills-pw2c** (pasta `docs/specs/project-manager/`) para humanos e para evoluir o produto; **não** vão para `.cursor/skills/project-manager/` na instalação.

## [CAMINHOS CANÓNICOS — SEM `docs/specs/`]

No **projeto do utilizador**, tudo sob **`docs/project-manager/`** (não usar `./docs/specs/**`):

- **Controlo:** `00-Controle_de_Specs.md`, `00-Ambiguidades.md`, `00-Fases/` (índices por fase + revisão técnica).
- **Domínio (fases iniciais):** p.ex. `20-Dominios/` (ex.: `Glossario.md`), paralelo a `Epics/`.
- **Backlog (árvore típica):**

```text
docs/project-manager/
  Epics/EPIC NN - Título do Epic/
    Stories/STORY NN - Título da Story/
      STORY NN - Título da Story.md
      Tasks/TASK NN - Título da Task/
        TASK NN - Título da Task.md
        Subtasks/SUBTASK NN - Título da Subtask.md
```

- **Referências transversais:** `NN-*.md` na raiz de `docs/project-manager/` quando existirem.

**Modo achatado (excepção):** quando aplicável (projeto **Mútua** em andamento **com** US/Task pai no ClickUp, ou pedido explícito), **não** é obrigatória a árvore `Epics/…/Stories/…/Tasks/…`. As especificações com UST ficam por **funcionalidade**: uma **pasta** por entrega (nome alinhado ao **Task pai / US pai** no ClickUp) e ficheiros `USXX - [stack] - ….md` dentro dela — ver **`references/Exemplo_Estrutura_Achatada.md`**. Ficheiros só na **raiz** de `docs/project-manager/` (ex.: `00-Controle_de_Specs.md`) seguem `NN-*.md` para o `pm-lint` (avisos se o prefixo faltar).

## [TRIGGER]

Ative quando o utilizador pedir: gestão de projeto, backlog, fases, UST, revisão técnica, golden rules, ambiguidades, **validar/corrigir links ou nomes** em `docs/project-manager`, glossário de domínio, ou **push/sync ClickUp** (`pm-push-clickup`, `pm-sync-clickup`, URL ClickUp).

## [PRÉ-REQUISITOS MCP]

- **ClickUp:** configurar servidor MCP no Cursor; fluxo em **`references/clickup-mcp-push.md`**. Ler **schemas** das tools antes de chamar.
- **UST / repertório:** quando o projeto tiver MCP de estimativas UST, preferir **sempre** a tool (ex.: `get-ust-estimates-directly`) antes do catálogo local — ver **[MCP UST E CATÁLOGO]**.
- **Tokens:** nunca no repo versionado.

## [VALIDAÇÃO MECÂNICA — `pm-lint`]

O pacote **`l-skills-pw2c`** (npm) expõe o comando de topo **`pm-lint`**, que verifica convenções de nomes e links sem gastar tokens do LLM em varreduras manuais.

- **Documentação:** **`references/pm-lint-cli.md`** (instalação, exemplos, papel do agente).
- **Fluxo típico:** com `l-skills-pw2c` instalado no projeto do produto, `npx l-skills-pw2c pm-lint` (e opcionalmente `--fix` com confirmação humana).
- **Papel do agente:** antes de operações grandes no vault (renomes, mover Epics, “consertar wikilinks”), **preferir** sugerir ou executar `pm-lint` em vez de validar ficheiro a ficheiro só com leituras.

### `pm-lint` vs. frontmatter e títulos

O `pm-lint` valida **nomes de ficheiros/pastas** e **links** (Markdown e wikilinks); **não** garante que `parent:`, `spec_refs` ou outros campos do frontmatter estejam sincronizados com o **título canónico** de uma Task depois de um rename.

- **Antes de renomear** uma Task (ou Epic/Story): usar **`grep`/search no repositório** sobre o identificador antigo (`TASK NN`, nome da nota, fragmentos do título) para listar **todas** as menções, incluindo Subtasks com `parent: "[[…]]"` e índices.
- **Depois do rename:** atualizar **explicitamente** frontmatter dos filhos (`parent`, etc.) e só então confiar em `pm-lint` para links óbvios; rever manualmente o que o linter não cobre.
- Se o agente se perder na correção, **reduzir o escopo** (uma Story de cada vez) e repetir grep após cada alteração.

### Renomeação em cascata (Epic, Story, Task)

Renomear pastas e notas em profundidade é **propício a erros** para um agente que só dispõe de edição de ficheiros e comandos de shell (não tem **F2** / rename símbolo do Cursor como um humano no IDE).

- **Se o utilizador puder** usar o IDE: preferir **rename em massa / refatoração** nativa do editor (multi-file rename) e só depois `pm-lint`.
- **Se o agente fizer o rename:** usar **ondas**, não “dezenas de replace cegos”:
  1. **Renomear** o ficheiro/pasta **pai** (Epic/Story/Task) com o caminho correto na árvore.
  2. **Atualizar** **filhos imediatos** (wikilinks, `parent` no frontmatter das Subtasks/Tasks descendentes, nomes de pasta que espelham o título).
  3. **`npx l-skills-pw2c pm-lint`** e **`--fix`** onde aplicável (links/wikilinks).
  4. **Revisão manual** do frontmatter de **todos** os filhos afetados e dos índices em `00-Fases/` — o `pm-lint` **não** atualiza `parent:` sozinho.
- **Limite:** `pm-lint` **não** renomeia pastas nem reescreve metadados; trata sobretudo de **links** e convenções de nome em `.md`.

## [ORDEM DE CRIAÇÃO — BACKLOG]

Ordem **lógica** no sistema de ficheiros (evita órfãos):

1. Existir a cadeia `Epics/…/Stories/…/Tasks/TASK NN - …/` com o ficheiro **`TASK NN - ….md`** no sítio certo.
2. **Só então** ficheiros em `Tasks/…/Subtasks/SUBTASK ….md` sob essa Task.

**Não** criar `Subtasks/` órfãs nem Subtasks sem Task pai no **mesmo ramo** da árvore.

### Eficiência de contexto (várias ferramentas / uma resposta)

A ordem acima **não** exige um **turno de conversa por ficheiro**. O agente pode, **numa única resposta**, emitir **várias** chamadas de ferramenta **em paralelo** (por exemplo criar a Task e todas as Subtasks do mesmo lote), desde que:

- os **caminhos** respeitem a hierarquia (a pasta `Task …` e `TASK ….md` existam antes ou no mesmo lote de forma consistente);
- não haja Subtasks em `Subtasks/` sem a Task correspondente no mesmo ramo.

Objetivo: menos ida-e-volta, **sem** relaxar a integridade da árvore.

### Excepção — backlog achatado (Mútua / US ou Task pai ou pedido explícito)

**Gatilhos:** (1) projeto **Mútua** já em **andamento** **e** o utilizador indicou uma **US pai** ou **Task pai** no ClickUp; **ou** (2) o utilizador pede explicitamente estrutura **achatada**.

Nestes casos:

- **Local:** **não** criar `Epics/…/Stories/…/Tasks/…/Subtasks/` para esse trabalho; usar **uma pasta por funcionalidade** sob `docs/project-manager/` (nome = funcionalidade / alinhado ao pai no ClickUp) e ficheiros **`USXX - [stack] - Título.md`** dentro dela, com UST e conteúdo técnico por ficheiro. Ver **`references/Exemplo_Estrutura_Achatada.md`**.
- **ClickUp:** criar ou sincronizar subtasks **todas ao mesmo nível**, como **filhas directas** da **US/Task pai** — **sem** recriar Epic/Story/Task intermediárias no remoto quando o acordo for esse; o **nome da funcionalidade** no ClickUp (pai) espelha o **nome da pasta** local.
- **Harmonização:** evitar árvore local profunda se o ClickUp estiver achatado sob um único pai; manter **1:1** entre ficheiros e tarefas orçamentadas quando aplicável.

Fora destes gatilhos, prevalece a árvore típica e a **[ORDEM DE CRIAÇÃO]** acima.

## [ARRANQUE]

1. Ler **`docs/project-manager/00-Controle_de_Specs.md`** (criar se faltar: bloco **Etapa atual** com Modo de operação, etapa, última atualização, resumo, próximo passo + **mapa de etapas** com checkboxes).
2. Regras de fases, gates e modos: **este documento** (secções abaixo); detalhe de templates: **`references/`**.

## [MODOS DE OPERAÇÃO]

- **«Modo de operação»** em `00-Controle_de_Specs.md`: `Ágil` ou `Completo`.
- **Ágil:** diálogo **cirúrgico** antes de `pm-new-*` (1–3 perguntas ou resumo + confirmação); gates flexíveis salvo **[COMPLEXIDADE E GATES NO MODO ÁGIL]**; Fase 5→6 rígido quando o índice de revisão existir e o checklist não estiver fechado **ou** quando um gatilho de complexidade se aplicar.
- **Completo:** todas as fases; Fase 2.5 obrigatória salvo decisão documentada; **Fase 5→6** bloqueada até checklist de revisão técnica completo.

## [COMPLEXIDADE E GATES NO MODO ÁGIL]

O modo ágil **não** autoriza “pular” Nota técnica ou revisão quando o **risco material** o exige.

Se a Story ou Task envolver qualquer **gatilho** abaixo, são **obrigatórios** mesmo em modo **Ágil**: checklist da **Fase 5** (revisão técnica), **Pre-Mortem** com pelo menos três causas plausíveis de falha, e **Nota técnica** adequada nas Tasks afetadas (ver `references/Guia_Nota_Tecnica_em_Tasks.md`).

**Gatilhos (lista mínima; a equipa pode acrescentar no controlo do projeto):**

- Alteração de **schema de base de dados** ou **migrações** com impacto em dados existentes.
- **Segurança** — inclui **autenticação, autorização, sessões, tokens**, e **refatoração de serviços ou fluxos de login** (não é “apenas refatoração” neutra: tratar como segurança até prova em contrário).
- **Dados pessoais** / requisitos de **compliance**.
- Alterações em **produção** críticas ou **sem estratégia de rollback** clara.

**In dubio, pro-revisio:** se houver **dúvida** se um gatilho se aplica (ex.: “será isto segurança?”), o agente **não** deve optar pelo caminho mais curto: **assumir que o gatilho aplica** e cumprir Fase 5 + Nota técnica, **ou** perguntar ao utilizador **uma** pergunta clara antes de avançar. Não usar o modo ágil para contornar revisão quando o domínio é ambíguo.

Fora destes casos, mantêm-se índices e formalismos **proporcionais** ao modo ágil, sem usar agilidade como desculpa para omitir o essencial quando o gatilho se aplica.

## [FASES — RESUMO]

Ordem: **1** Contexto e visão → **1.1** Lacunas → **2** Especificar → **2.5** Regras de ouro (`pm-setup-rules`) → **3** Desenhar (opcional) → **4** Decompor → **5** Revisão técnica → **6** Executar.

- Documentação de domínio nas fases 1–3: sob `docs/project-manager/20-Dominios/` (ou pasta acordada), incluindo **`Glossario.md`** quando existir.
- **Gerar/atualizar** `docs/project-manager/00-Fases/Indice_-_Fase_*.md` e `Indice_-_Revisao_tecnica.md` conforme artefactos.

## [COMANDOS INTERNOS]

| Comando                               | Acção                                                                                                                                                                                                                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pm-new-epic`                         | `EPIC NN - ….md` + pasta em `Epics/`; tag tipo `pm/epic`.                                                                                                                                                                                       |
| `pm-new-story`                        | Idem em `Stories/`; `pm/story`; ligação ao Epic.                                                                                                                                                                                                |
| `pm-new-task`                         | Idem em `Tasks/`; `pm/task` + ≥1 tag domínio (`pm/backend`, …); **`references/Template_Task.md`**. Pode ser criada na **mesma resposta** que as Subtasks se a hierarquia de caminhos for respeitada — ver **«Eficiência de contexto»**.         |
| `pm-new-subtask`                      | Em `Subtasks/` sob a Task correta; `pm/subtask`; **`references/Template_Subtask.md`**; UST opcional. Ver **[MCP UST E CATÁLOGO]**. Não criar sem Task pai no mesmo ramo (ver **«Ordem de criação»**).                                           |
| `pm-add-term`                         | Adicionar ou atualizar entrada em **`docs/project-manager/20-Dominios/Glossario.md`** (criar a partir de **`references/Template_Glossario.md`** se necessário); garantir nomenclatura única no domínio.                                         |
| `pm-setup-rules`                      | **`references/Company_Backend_Golden_Rules_Template`**, **`Company_Frontend_Golden_Rules_Template`**; saída `02-Backend_Golden_Rules.md` / `03-Frontend_Golden_Rules.md` em `docs/project-manager/` + regras do agente (ex. `.cursor/rules/…`). |
| `pm-budget-report`                    | Agregar UST das Subtasks em `docs/project-manager/**/*.md`.                                                                                                                                                                                     |
| `pm-push-clickup` / `pm-sync-clickup` | **`references/clickup-mcp-push.md`**; gate humano antes de escrita remota. Títulos remotos **sem** prefixos `EPIC`/`STORY`/`TASK`/`SUBTASK`; stack obrigatória; detalhes em **[PUSH/SYNC CLICKUP — TÍTULOS E UST]**.                            |
| `pm-lint` (CLI)                       | Comando **`l-skills-pw2c pm-lint`** no repositório do produto; ver **`references/pm-lint-cli.md`**. Não é invocação simbólica do agente — é binário npm.                                                                                        |

**Nomes:** prefixos `EPIC` / `STORY` / `TASK` / `SUBTASK` + `NN` (dois dígitos); **sem** `[` `]` nos nomes. **Renomear Epic:** usar fluxo em **Renomeação em cascata** (não depender só de edição manual ficheiro a ficheiro).

## [PUSH/SYNC CLICKUP — TÍTULOS E UST]

- **Título no ClickUp:** ao criar ou actualizar o nome da task remota, **remover** prefixos de controlo interno (`EPIC NN -`, `STORY NN -`, `TASK NN -`, `SUBTASK NN -`, etc.). O nome **remoto** deve ser legível e alinhado à equipa (ex.: `USOff - backend - Nome da tarefa`); **classificação de stack obrigatória:** `backend` | `frontend` | `infra` | `story` | `docs` | `other`.
- **Local vs remoto:** no **modo árvore**, ficheiros e pastas podem manter `TASK NN - …`; o **título enviado ao ClickUp** é sempre derivado **sem** esses prefixos. No **modo achatado**, usar pasta por funcionalidade e `USXX - [stack] - ….md` (ver **`references/Exemplo_Estrutura_Achatada.md`**); o **pai** no ClickUp alinha com o **nome da pasta** (US/Task pai).
- **Norma completa:** **`references/clickup-mcp-push.md`** (inclui hierarquia achatada, atomicidade UST no fluxo de escrita e conflitos com o remoto).

## [GATE: FASE 5 → FASE 6]

Sem avançar para execução como “revisão fechada” se `docs/project-manager/00-Fases/Indice_-_Revisao_tecnica.md` tiver checklist com `- [ ]` **quando esse índice existir**. Antes: ler Épico; **Dry Run**; **Pre-Mortem** (≥3 causas). Guias: **`references/Guia_Revisao_Tecnica_Fase5.md`**, **`references/Template_Checklist_Revisao_tecnica.md`**.

**Briefing de execução:** ao fechar o gate para desenvolvimento, o agente **deve** produzir um **Briefing de execução** para o humano que vai implementar, usando **`references/Briefing_Execucao_Fase5.md`**: colar no topo da Task em Markdown e/ou enviar como **comentário** no ClickUp (com `pm-push-clickup`), conforme política do projeto. O briefing resume a Nota técnica, ficheiros afetados, riscos e critérios de aceitação.

## [AMBIGUIDADES]

`docs/project-manager/00-Ambiguidades.md`: estado Aberta/Resolvida + impacto (wikilinks para Tasks/Stories).

## [MCP UST E CATÁLOGO]

1. **Preferir MCP:** com servidor de repertório/estimativas UST disponível (ex.: tool `get-ust-estimates-directly`), obter lista ou sugestões **antes** de fixar `ust_code`. Ler sempre o descritor da tool no ambiente atual.
2. **Fallback:** tabela local — copiar **`references/UST_Catalog.md`** para `docs/project-manager/UST_Catalog.md` (ou nome acordado) e manter códigos usados pelo projeto; ver instruções dentro desse ficheiro.
3. **Falha total:** não inventar código; registar em `00-Ambiguidades.md` ou perguntar ao utilizador.
4. Sugestão de código com **confirmação** explícita quando inferida; nunca gravar `ust_code` inventado.
5. **Regra de ouro (faturamento — 1:1):** é **proibido** concentrar **vários** códigos UST **distintos** na mesma Subtask/Task no ClickUp. **Exemplo a evitar:** uma única tarefa de frontend “11.5 UST” que mistura P.3 (componente), P.4 (validação) e P.5 (lógica). Se o escopo exigir mais de um `ust_code`, o agente **deve desmembrar** em **várias** tarefas atómicas (cada uma com **um** `codigo_ust`), no ClickUp e, em modo achatado, em **vários** `.md` na pasta da funcionalidade ou várias subtasks filhas da **US/Task pai**. Ver fluxo de push em **`references/clickup-mcp-push.md`**.

## [PRIVACIDADE]

Sem segredos em Markdown nem em comentários ClickUp.

## [INTEGRAÇÃO]

Opcional: **story-architect**, **pw2c-knowledge-base**.

## [REFERÊNCIA RÁPIDA — SÓ `references/` OPERACIONAIS]

| Ficheiro                                               | Uso                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| `references/Template_Task.md`                          | Estrutura da Task                                                          |
| `references/Template_Subtask.md`                       | Subtask + UST                                                              |
| `references/Template_Story.md`                         | Story                                                                      |
| `references/Template_Glossario.md`                     | Base para `20-Dominios/Glossario.md`                                       |
| `references/Template_Checklist_Revisao_tecnica.md`     | Checklist Fase 5                                                           |
| `references/Guia_Revisao_Tecnica_Fase5.md`             | Revisão técnica                                                            |
| `references/Guia_Nota_Tecnica_em_Tasks.md`             | Nota técnica vs evidências                                                 |
| `references/Boas_Praticas_Historias_de_Utilizador.md`  | Stories / INVEST                                                           |
| `references/Company_Backend_Golden_Rules_Template.md`  | `pm-setup-rules` backend                                                   |
| `references/Company_Frontend_Golden_Rules_Template.md` | `pm-setup-rules` frontend                                                  |
| `references/UST_Catalog.md`                            | Template catálogo UST + ordem MCP                                          |
| `references/Briefing_Execucao_Fase5.md`                | Briefing pós-Fase 5                                                        |
| `references/Exemplo_Estrutura_Achatada.md`             | Modo achatado: pasta por funcionalidade, `USXX - [stack] - …`, US/Task pai |
| `references/clickup-mcp-push.md`                       | MCP ClickUp, push/sync                                                     |
| `references/pm-lint-cli.md`                            | CLI `l-skills-pw2c pm-lint`                                                |
