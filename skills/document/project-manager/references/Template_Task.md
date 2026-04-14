# Template — Task (referência)

Modelo para `TASK NN - ….md` dentro de `…/Stories/STORY NN - …/Tasks/TASK NN - …/`. Guia da Nota técnica: [[Guia_Nota_Tecnica_em_Tasks]]. Spec: [[07-nota-tecnica-templates-e-user-stories]].

> **Nota:** Apagar este bloco citacional após criar a Task real.

---

```yaml
---
tags:
  - pm/task
  - pm/backend # pelo menos uma tag de domínio
parent: "[[STORY NN - Título da Story]]"
spec_refs: []
---
```

# TASK NN - Título curto

## Contexto (opcional)

Porque esta Task existe; uma ou duas frases.

## Critérios de aceitação

- [ ] …
- [ ] …

## Evidências

O que deve ser apresentado para **verificar** o cumprimento (artefactos, links, critérios de revisão de código, etc.).

## Nota técnica

Orientação do **líder técnico** ao desenvolvedor: riscos, padrões, dependências, o que não fazer. Ver [[Guia_Nota_Tecnica_em_Tasks]]. Se não houver ressalvas: _Sem ressalvas técnicas adicionais._

## Subtasks

Ligação à pasta `Subtasks/` ou lista de wikilinks à medida que forem criadas.
