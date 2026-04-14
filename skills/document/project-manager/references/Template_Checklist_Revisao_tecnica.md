# Template — Secção «Checklist de aprovação da revisão técnica»

Copiar para `docs/project-manager/00-Fases/Indice_-_Revisao_tecnica.md` (ou mesclar com o conteúdo existente). Título da secção: **«Checklist de aprovação da revisão técnica»**. Ver [[08-fase-5-revisao-tecnica-avancada]].

> Personalizar itens por projeto. Os marcados com _(obrigatório normativo)_ alinham à spec `08`.

---

## Artefactos da Fase 5 (por Task ou por lote)

- [ ] _(obrigatório normativo)_ **Contexto do Épico:** foi lido o **Épico pai** (e Stories relevantes) para cobrir interfaces entre Tasks?
- [ ] _(obrigatório normativo)_ **Mapa de impacto (Dry Run):** existe artefacto (neste índice ou nota ligada) com ficheiros a tocar, assinaturas/contratos e dependências?
- [ ] _(obrigatório normativo)_ **Pre-Mortem:** foram listadas **≥3** causas raiz plausíveis de falha crítica se a spec fosse seguida à risca?

## Qualidade e profundidade

- [ ] Foram identificados explicitamente os **unhappy paths** (caminhos de erro/excepção)?
- [ ] O **contrato de dados** (payload/response, schema de BD) para as Tasks em revisão foi **cruzado** com as outras Stories do mesmo Épico?
- [ ] O **fora de âmbito** desta(s) Task(s) está explícito para evitar scope creep na Fase 6?

## Lentes de perspectiva (opcional — só se ativado)

- [ ] Rodada **Arquiteto:** contratos entre Tasks / consumo de dados validado.
- [ ] Rodada **QA paranoico:** excepções, timeouts, duplo submit, estados limite.
- [ ] Rodada **Dev júnior:** clareza e alinhamento a ficheiros de referência.

## Aprovação final

- [ ] Decisão de **pronto para Fase 6** registada (nome/data ou equivalente no projeto).
