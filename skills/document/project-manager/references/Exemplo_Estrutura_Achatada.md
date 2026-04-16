# Exemplo — estrutura achatada (Mútua / US ou Task pai ClickUp)

Este ficheiro é **ilustrativo**: as regras normativas completas estão em `SKILL.md` e `references/clickup-mcp-push.md`. Use-o para alinhar **repositório local** e **ClickUp** quando se aplica o modo achatado.

## Quando usar este padrão

- Projeto **Mútua** já **em andamento** e o utilizador indicou uma **US pai** ou **Task pai** no ClickUp; **ou**
- O utilizador pede explicitamente backlog **achatado** (sem árvore Epic → Story → Task completa).

## Modo árvore (predefinido da skill) — recapitulação

Estrutura típica sob `docs/project-manager/`:

```text
docs/project-manager/
  Epics/EPIC 01 - Título/
    Stories/STORY 01 - Título/
      STORY 01 - Título.md
      Tasks/TASK 01 - Título/
        TASK 01 - Título.md
        Subtasks/SUBTASK 01 - Título.md
```

## Modo achatado — local (padrão recomendado)

Sem criar `Epics/…/Stories/…/Tasks/…`. Agrupa-se por **funcionalidade** (uma pasta por entrega), alinhada ao **nome da US/Task pai** no ClickUp. Dentro da pasta, um `.md` por esforço atómico (1 UST por ficheiro — ver `SKILL.md`).

**Convenção de nomes de ficheiro:** `USXX - [stack] - Título descritivo.md`

- **`USXX`:** identificador da user story alinhado ao projecto (ex.: `US12`, `US03`). Mantém-se **igual** em todos os ficheiros da mesma pasta quando descrevem a mesma US.
- **`[stack]`:** obrigatório, um de: `story` | `backend` | `frontend` | `infra` | `docs` | `other` (entre parêntesis rectos, como no exemplo da equipa).
- **Título:** curto, legível; pode espelhar o card no ClickUp (sem prefixos `TASK`/`SUBTASK` no **remoto**).

Exemplo (equivalente ao modelo de trabalho da equipa):

```text
docs/project-manager/
  00-Controle_de_Specs.md
  00-Ambiguidades.md
  00-Fases/
  20-Dominios/
  Nova funcionalidade/
    US12 - [story] - Nova funcionalidade.md
    US12 - [backend] - Inclusão do Campo no db.md
    US12 - [frontend] - Inclusão de Informações no frontend.md
```

- O nome da pasta **`Nova funcionalidade/`** deve corresponder ao **nome da funcionalidade** tal como está na **Task pai** ou **US pai** no ClickUp (é o âncora semântico entre repo e board).
- Ficheiros de controlo (`00-…`, `20-Dominios/`, etc.) mantêm-se à **raiz** de `docs/project-manager/` como no resto da skill.

### Frontmatter mínimo (fictício)

```yaml
---
tags:
  - pm/subtask
  - pm/backend
# ust_code: "P.3"   # um único código por ficheiro
# ust_quantity: 1
# clickup_task_id: "<subtask ou task filha>"
# clickup_parent_task_id: "<US/Task pai — alinhar com pasta e ClickUp>"
# clickup_url: "https://app.clickup.com/t/..."
---
```

## Modo achatado — remoto (ClickUp)

- **Card pai (US ou Task pai):** o **título** deste card no ClickUp deve alinhar com o **nome da pasta** no repositório (ex.: pasta `Nova funcionalidade/` ↔ task pai «Nova funcionalidade»).
- **Subtasks:** todas como **filhas directas** desse pai, **ao mesmo nível** (sem hierarquia Epic → Story → Task intermédia no remoto, quando esse for o acordo).

```text
US/Task pai — «Nova funcionalidade»  (nome = pasta local)
├── US12 - backend - Inclusão do Campo no db
├── US12 - frontend - Inclusão de Informações no frontend
└── (opcional) US12 - story - …   — se a equipa orçamentar a nível story
```

**Títulos no ClickUp:** orgânicos, **sem** prefixos de controlo interno (`TASK 01 -`, `SUBTASK 01 -`). No remoto use **stack** no título (ex.: `US12 - backend - …`); os **parêntesis rectos `[backend]`** podem ser convenção só no nome do ficheiro local, se o ClickUp não os usar — o importante é **uma stack clara** e **1:1** com UST.

## Comparação rápida

| Aspeto        | Modo árvore                  | Modo achatado                                                               |
| ------------- | ---------------------------- | --------------------------------------------------------------------------- |
| Pastas locais | `Epics/…/Stories/…/Tasks/…`  | Uma pasta por funcionalidade; ficheiros `USXX - [stack] - ….md` dentro dela |
| ClickUp       | Conforme política do produto | Subtasks ao mesmo nível sob a **US/Task pai** (nome = pasta)                |
| UST           | 1 código por Subtask         | 1 código por ficheiro / 1 por task remota                                   |

Para push/sync: `references/clickup-mcp-push.md` (gate humano, títulos limpos, atomicidade UST).
