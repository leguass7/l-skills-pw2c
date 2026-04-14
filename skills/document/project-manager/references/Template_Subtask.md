# Template — Subtask (referência)

Modelo para clonar ao criar `SUBTASK NN - ….md` sob `…/Tasks/TASK NN - …/Subtasks/` (só depois de existir a Task pai). Contrato de frontmatter e UST: ver secções **«CAMINHOS CANÓNICOS»**, **«ORDEM DE CRIAÇÃO»** e **«MCP UST E CATÁLOGO»** no `SKILL.md`; catálogo local: `references/UST_Catalog.md` (cópia em `docs/project-manager/` no produto).

> **Nota:** Apagar este bloco citacional após criar a Subtask real.

---

```yaml
---
tags:
  - pm/subtask
  - pm/backend # ou pm/frontend, pm/infra, … — pelo menos uma tag de domínio
parent: "[[TASK NN - Título da Task]]"
spec_refs: []
# Se orçamentada com UST:
# ust_code: ""
# ust_quantity: 1
# ust_unit_value: 0
---
```

# SUBTASK NN - Título curto

## Objetivo

Descrever em uma frase o entregável desta Subtask.

## Critérios locais

- [ ] …
- [ ] …

## Evidências esperadas

O que deve existir ao concluir (PR, teste, artefacto).

## Ligações

- Task pai: [[TASK NN - Título da Task]]
- Nota técnica da Task (se relevante): ver secção «Nota técnica» na Task pai.

## Observações de execução (opcional)

Pontos específicos **desta** Subtask que não cabem na Nota técnica da Task; deixar vazio se não aplicável.
