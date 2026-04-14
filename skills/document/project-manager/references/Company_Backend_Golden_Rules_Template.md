# Template de catálogo — Regras de ouro Backend (empresa / programa)

> **Uso:** não copiar como documento final. O comando `pm-setup-rules` ([[09-regras-de-ouro-e-pm-setup-rules]]) usa este ficheiro para **montar a entrevista**; só entram na versão final de `docs/project-manager/02-Backend_Golden_Rules.md` as opções **confirmadas** pelo utilizador.

---

## Metadados do projeto (preencher após detecção)

- **Stack detectada:** (ex.: Node 20, NestJS, Prisma, PostgreSQL)
- **Repositório / pacotes relevantes:** (ex.: `apps/api`)

---

## Bloco A — Arquitetura e organização

**Estilo principal (uma ou combinação documentada):**

- [ ] Clean Architecture (camadas explícitas)
- [ ] Hexagonal / ports & adapters
- [ ] MVC clássico em monólito modular
- [ ] Outro: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

**Normas candidatas à entrevista (marcar as propostas ao utilizador):**

1. [ ] **Inversão de dependência** obrigatória em serviços de domínio (sem acoplar implementações concretas).
2. [ ] **Controllers finos** — sem regra de negócio; apenas DTO + contexto + delegação ao serviço.
3. [ ] **Um módulo por bounded context** (ou convenção equivalente documentada).
4. [ ] **Proibição** de chamadas HTTP/SDK de terceiros no meio do domínio — apenas através de adapters/providers.

---

## Bloco B — Dados e validação

1. [ ] **Validação de entrada** com schema (ex.: Zod, class-validator, Joi) em **todas** as entradas HTTP/mensagens.
2. [ ] **Transacções** obrigatórias para operações multi-tabela críticas.
3. [ ] **Soft delete** por defeito onde aplicável; hard delete só com exceção documentada.
4. [ ] **Multi-tenancy** explícito (nunca filtro «mágico» oculto sem auditoria).

---

## Bloco C — API e contratos

1. [ ] **Padrão de resposta JSON** (envelope, códigos de erro, trace id) conforme RFC interna / guia: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***
2. [ ] **Versionamento** de API (`/v1`, header, ou estratégia fixa).
3. [ ] **Idempotência** em endpoints de escrita sensíveis (quando aplicável).

---

## Bloco D — Segurança e operações

1. [ ] **Autenticação/autorização** em camadas (módulo + roles) sem rotas acidentalmente públicas.
2. [ ] **Segredos** apenas via variáveis de ambiente / secret manager — nunca no repositório.
3. [ ] **Operações assíncronas** pesadas via fila/worker, sem bloquear request crítico.

---

## Bloco E — Observabilidade e qualidade

1. [ ] **Logs estruturados** com correlação (request id).
2. [ ] **Testes** mínimos: contrato ou integração para fluxos críticos (definir no texto final).

---

## Saída esperada após confirmação

- Documento `docs/project-manager/02-Backend_Golden_Rules.md` com **apenas** itens confirmados, mais secção **«Decisões tomadas em [data]»** e **«Fora de âmbito»** se o utilizador recusou normas do catálogo.
