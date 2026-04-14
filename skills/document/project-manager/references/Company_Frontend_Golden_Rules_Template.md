# Template de catálogo — Regras de ouro Frontend (empresa / programa)

> **Uso:** não copiar como documento final. O comando `pm-setup-rules` ([[09-regras-de-ouro-e-pm-setup-rules]]) usa este ficheiro para **montar a entrevista**; só entram na versão final de `docs/project-manager/03-Frontend_Golden_Rules.md` as opções **confirmadas** pelo utilizador.

---

## Metadados do projeto (preencher após detecção)

- **Stack detectada:** (ex.: React 18, Next.js 14, Vite, TanStack Query)
- **Pastas relevantes:** (ex.: `apps/web`, `src/components`)

---

## Bloco A — Arquitetura UI e estado

**Organização preferida:**

- [ ] Feature folders (por domínio)
- [ ] Atomic Design (ou híbrido documentado)
- [ ] Por tipo (`components/`, `hooks/`, `pages/`) — legado aceite se explícito
- [ ] Outro: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

**Normas candidatas à entrevista:**

1. [ ] **Estado servidor** vs **cliente** explícito (evitar duplicar fonte de verdade).
2. [ ] **Data fetching** centralizado (ex.: React Query) com política de cache/invalidação documentada.
3. [ ] **Sem lógica de negócio pesada** em componentes de apresentação — hooks ou serviços.

---

## Bloco B — Contrato com API e formulários

1. [ ] **Tipos ou schemas** alinhados ao contrato OpenAPI/backend (gerados ou manuais).
2. [ ] **Validação de formulários** espelhando regras do backend (ex.: Zod partilhado ou duplicado documentado).
3. [ ] **Tratamento de erro** de API com mensagens utilizador + registo técnico (sem expor stack).

---

## Bloco C — UX, acessibilidade e i18n

1. [ ] **Acessibilidade mínima:** foco, rótulos, contraste, teclado (definir nível no texto final).
2. [ ] **Estados de UI:** loading, vazio, erro — obrigatórios em fluxos críticos.
3. [ ] **Internacionalização** (quando aplicável): chaves e locale único por sessão.

---

## Bloco D — Performance e qualidade

1. [ ] **Code splitting** / lazy routes onde o bundle exceder limiar do projeto.
2. [ ] **Imagens e assets** otimizados (formato, dimensão, lazy load).
3. [ ] **Lint e format** alinhados ao CI (ESLint/Prettier ou equivalente).

---

## Bloco E — Segurança no cliente

1. [ ] **Nunca** armazenar segredos ou tokens sensíveis em `localStorage` sem justificação e review.
2. [ ] **XSS:** evitar `dangerouslySetInnerHTML`; sanitizar se inevitável.

---

## Saída esperada após confirmação

- Documento `docs/project-manager/03-Frontend_Golden_Rules.md` com **apenas** itens confirmados, mais **«Decisões tomadas em [data]»** e **«Fora de âmbito»** quando aplicável.
