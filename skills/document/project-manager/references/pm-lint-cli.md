# Comando `pm-lint` (CLI `skills-pw2c`)

## O que é

Ferramenta **mecânica** (fora do raciocínio do LLM) que valida `docs/project-manager/`: nomes de pastas/ficheiros alinhados às convenções do backlog, links Markdown relativos e wikilinks estilo Obsidian. Opcionalmente **corrige** casing em links e wikilinks (`--fix`).

## Onde está

Faz parte do pacote npm **`skills-pw2c`** (comando de topo `pm-lint`), não de ficheiros soltos no projeto do utilizador.

## Como o desenvolvedor usa

1. Ter **`skills-pw2c`** no projeto (recomendado como devDependency):

   `npm install -D skills-pw2c`

2. Na raiz do repositório do produto (onde existe `docs/project-manager/`):

   ```bash
   npx skills-pw2c pm-lint
   npx skills-pw2c pm-lint --fix
   npx skills-pw2c pm-lint --root docs/project-manager
   npx skills-pw2c pm-lint --json
   ```

3. Opcional: script em `package.json` do produto:

   `"scripts": { "pm-lint": "skills-pw2c pm-lint" }`

## Como o agente deve usar (para poupar tokens)

- **Antes** de grandes refactors em `docs/project-manager/**` (renomes em cascata, mover Epics, corrigir wikilinks manualmente), **preferir** pedir ao utilizador para executar `npx skills-pw2c pm-lint` (ou `--fix` após confirmação), **ou** executar o mesmo comando no terminal do projeto **se** a política do ambiente permitir comandos não interativos.
- **Não** substituir o `pm-lint` por verificação link-a-link só com o modelo; usar o comando para erros de grafo e de nome.
- Se `skills-pw2c` **não** estiver instalado no projeto, o agente deve **indicar** os comandos acima e o benefício (validação única vs. muitas leituras ao vault).

## Saída

- Código de saída `0` = sem erros bloqueantes; `1` = há erros (`severity: error`).
- `--json` envia relatório estruturado para stdout (adequado a CI).
