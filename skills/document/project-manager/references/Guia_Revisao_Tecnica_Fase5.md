# Guia — Técnicas avançadas de revisão técnica (Fase 5)

Catálogo de **conceitos** que a `SKILL.md` pode aplicar na **Fase 5 — Revisão técnica**. Spec normativa: [[08-fase-5-revisao-tecnica-avancada]].

## O que está no pacote por defeito (sem perguntar)

Definido em [[08-fase-5-revisao-tecnica-avancada]]: **contexto do Épico** (leitura integral) + **Dry Run** (mapa de impacto) + **Pre-Mortem**. Estes três são **obrigatórios** antes de marcar o checklist de aprovação.

## Técnicas opcionais (o agente pode perguntar ao utilizador)

No início da Fase 5 (ou ao iniciar um lote de revisão), o agente **pode** perguntar quais técnicas **adicionais** ativar, com base nas secções abaixo. Se o utilizador preferir o mínimo, manter só o pacote por defeito.

---

### 1. Pre-Mortem (inversão de premissa)

**Ideia:** Assumir que a implementação **já falhou** em produção e listar causas raiz plausíveis.

**Prompt interno sugerido (adaptar ao contexto):**

> Atue como engenheiro(a) staff sénior. Imagine que esta Task foi implementada **exactamente** como descrita, foi para produção e causou um **bug crítico**. Liste **pelo menos três** causas raiz possíveis, considerando: concorrência, dados nulos ou inválidos, falha ou latência de rede, inconsistência de contrato entre serviços, e efeitos em Tasks vizinhas no mesmo Épico.

**Porque ajuda:** Reduz o viés de concordância e força atenção a casos de borda e infraestrutura.

_Nota:_ Mesmo no pacote mínimo, o Pre-Mortem já está **obrigatório**; este bloco documenta o raciocínio para a skill.

---

### 2. Dry Run — Mapa de impacto (execução mental)

**Ideia:** Antes de aprovar, o agente **simula** a implementação sem escrever código produtivo, produzindo um artefacto rastreável.

**O artefacto «Mapa de impacto (Dry Run)» deve cobrir, quando aplicável:**

1. **Ficheiros** exactos a **criar** ou **alterar** (caminhos relativos ao repo).
2. **Assinaturas** de métodos, funções ou **contratos de API** (endpoints, payloads/respostas) que precisam de mudança.
3. **Dependências:** bibliotecas ou pacotes **ainda não** presentes em `package.json`, `requirements.txt`, `Cargo.toml`, etc., ou dependências de infraestrutura (filas, segredos).

**Porque ajuda:** O modelo deixa de «só ler Markdown» e confronta a spec com a estrutura real do código.

---

### 3. Lentes de perspectiva (rodadas sequenciais)

**Ideia:** Revisões **genéricas** são fracas; personas **sequenciais** obrigam ângulos distintos antes de `- [x]`.

| Rodada | Persona          | Foco                                                                                                                      |
| ------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A      | **Arquiteto(a)** | Task vs Épico: como os dados desta Task serão consumidos por Tasks vizinhas? Contrato JSON/schema explícito?              |
| B      | **QA paranoico** | Fluxos de **excepção**: timeout de API terceira (ex. 30s), duplo submit, rate limit, estados vazios.                      |
| C      | **Dev júnior**   | Clareza: termos não definidos nos ficheiros de referência? UI sem cor de botão, mensagem de erro exacta, passos ambíguos? |

**Uso:** Opcional; só após confirmação do utilizador ou política explícita no projeto.

---

### 4. Checklist anti-superficialidade

Itens **binários** e **rastreáveis** (integrar em `Indice_-_Revisao_tecnica.md` — ver [[Template_Checklist_Revisao_tecnica]]), por exemplo:

- Foram identificados explicitamente os **unhappy paths** (erro/excepção)?
- O **contrato de dados** (payload/response, schema de BD) foi validado contra as **outras Stories do Épico**?
- O que está **fora de âmbito** nesta Task está explícito para evitar **scope creep** na codificação?

---

## Evolução

Novas técnicas ou variantes de prompt devem ser acrescentadas **aqui** e referenciadas em [[08-fase-5-revisao-tecnica-avancada]].
