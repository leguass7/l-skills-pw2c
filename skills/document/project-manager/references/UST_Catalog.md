# Catálogo UST — fallback no projeto (referência)

Este ficheiro é um **contrato** para o repositório do **produto**: copie-o para `docs/project-manager/` (ou caminho acordado) e **preencha** a tabela com os códigos que o projeto usa. O pacote da skill traz apenas **template**; a lista integral pode ser **sincronizada** a partir do MCP quando disponível.

## Ordem de consulta (obrigatória para o agente)

1. **MCP de repertório UST** (quando existir no Cursor): invocar primeiro a ferramenta adequada — em ambientes Mútua costuma existir `get-ust-estimates-directly` (lista de estimativas/códigos). **Sempre** ler o schema/descritor da tool no projeto (`mcps/.../tools/*.json`) antes de chamar.
2. **`UST_Catalog.md` no repo do produto** (este documento, após cópia para `docs/project-manager/`): tabela local como **fallback** quando o MCP não estiver disponível, falhar ou devolver resultado incompleto.
3. **Se ambos falharem:** **não** inventar `ust_code`. Registar em `00-Ambiguidades.md` ou **pedir** ao utilizador o código e a quantidade.

## Sincronização com o MCP

- Opcional: após obter lista via MCP, **atualizar** a tabela abaixo e registar a data em «Última sincronização».
- O catálogo versionado no projeto pode ser um **extract** parcial; não é obrigatório duplicar milhares de linhas no Git se a política do time for confiar no MCP em CI.

**Última sincronização com MCP (manual):** _— preencher —_

## Tabela (template)

| Código UST | Descrição curta    | Notas |
| ---------- | ------------------ | ----- |
| _ex.: P.1_ | _ex.: API backend_ |       |
|            |                    |       |

## Uso nas Subtasks

- Um ficheiro Subtask ⇢ no máximo **um** `ust_code` no frontmatter; ver `references/Template_Subtask.md` e secção UST em `SKILL.md`.
- Sugestão de código: **sempre** com confirmação explícita do utilizador quando inferida.
