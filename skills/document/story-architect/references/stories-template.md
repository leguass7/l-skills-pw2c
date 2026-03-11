---
id: ${nome_da_historia_kebab_case}
type: DESIGN_DECISION
scope: FEATURE:${domain}
project: [NOME_DO_PROJETO]
tags: [user-story, agile, ${projeto_slug}, ${tech_tags}]
---

# 🧠 Knowledge Card: US - ${Titulo_da_Historia}

> **Nota:** Este card documenta uma decisão de negócio e funcionalidade para indexação no LightRAG.

## 🎯 Enunciado

**Como** [persona],
**eu quero** [ação/funcionalidade],
**para que** [valor de negócio/benefício].

## 📋 Critérios de Aceite (Gherkin)

- **Cenário 1: [Sucesso]**
  - **Dado que** [contexto inicial],
  - **Quando** [ação do usuário],
  - **Então** [resultado esperado].

- **Cenário 2: [Exceção/Erro]**
  - **Dado que** [contexto],
  - **Quando** [ação],
  - **Então** [comportamento do sistema/erro].

## 🛡️ Regras de Negócio e Restrições

- [Regra 1]
- [Regra 2]

## 🛠️ Notas Técnicas e Dependências

- **Dependências:** [IDs de outras histórias ou componentes]
- **Arquivos Relacionados:** [Caminhos de arquivos no repositório]

---

## [RULES FOR LIGHTRAG INDEXING]

- O campo `type` para User Stories deve ser sempre `DESIGN_DECISION` (pois define como o software deve se comportar).
- O campo `id` deve ser único para evitar colisões no banco vetorial.
- O campo `scope` deve usar o prefixo `FEATURE:` seguido pelo domínio funcional.
- Garanta que a seção `# 🧠 Knowledge Card` esteja presente para facilitar a recuperação semântica por outros agentes.
