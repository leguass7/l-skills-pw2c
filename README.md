# skills-pw2c

[![Release](https://github.com/healthdevio/skills-pw2c/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/healthdevio/skills-pw2c/actions/workflows/release.yml) [![CI](https://github.com/healthdevio/skills-pw2c/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/healthdevio/skills-pw2c/actions/workflows/ci.yml)

CLI e servidor MCP para distribuir skills pré-definidas da HealthDev aos desenvolvedores.

O projeto foi inspirado na ideia do [`tech-leads-club/agent-skills`](https://github.com/tech-leads-club/agent-skills), mas focado em um catálogo interno simples, versionado no GitHub e pronto para CI/CD.

## Objetivos

- instalar skills rapidamente em projetos dos devs
- remover skills que não serão mais usadas
- atualizar skills já instaladas
- expor o catálogo local via MCP para o Cursor localizar habilidades
- permitir que líderes do time adicionem novas skills sem alterar a arquitetura da CLI

## Instalação

O pacote está publicado no [npm](https://www.npmjs.com/package/skills-pw2c). Para usar sem instalar globalmente:

```bash
npx skills-pw2c skill install example-skill
npx skills-pw2c skill list
npx skills-pw2c mcp
```

Se preferir instalar no seu projeto (ou globalmente), use `npm install skills-pw2c`. O binário fica disponível como `skills-pw2c`.

## Uso da CLI

```bash
skills-pw2c skill install <skill-id>
skills-pw2c skill uninstall <skill-id>
skills-pw2c skill list               # lista todas as skills do catálogo
skills-pw2c skill list --installed   # lista apenas as instaladas no projeto atual
skills-pw2c skill list --available   # lista apenas as não instaladas
skills-pw2c skill update <skill-id>
skills-pw2c skill update --all
```

Com `npx` (sem instalar):

```bash
npx skills-pw2c skill install example-skill
npx skills-pw2c skill uninstall example-skill
npx skills-pw2c skill list
npx skills-pw2c mcp
```

Se o comando não exibir nenhuma linha:

- verifique a versão do Node (>= 20);
- confira se o pacote foi baixado corretamente (`node_modules/skills-pw2c/skills/registry.json` existe);
- rode o comando com `--json` para ajudar no debug:

```bash
npx skills-pw2c skill list --json
```

## Onde as skills são instaladas

Por padrão, a instalação acontece em:

`<projeto>/.cursor/skills/<skill-id>`

O arquivo de estado fica em:

`<projeto>/.cursor/skills-pw2c/state.json`

Esse arquivo funciona como um índice local das skills instaladas. Ele guarda metadados como `id`, `version`, `installedAt` e `category`, permitindo que a CLI saiba rapidamente o que está instalado para comandos como `skill list`, `skill update` e `skill update --all`.

Quando a última skill é removida, o `state.json` também é apagado. A pasta `.cursor/skills-pw2c` só é removida se estiver vazia, para não apagar arquivos extras adicionados manualmente.

Opções da CLI para paths: `--project-dir`, `--install-dir`, `--state-file`. Variáveis de ambiente: `LPW2C_PROJECT_DIR`, `LPW2C_INSTALL_DIR`, `LPW2C_STATE_FILE`.

## Comando MCP

O comando abaixo sobe um servidor MCP local via `stdio`:

```bash
skills-pw2c mcp
```

Ferramentas expostas: `search_skills`, `read_skill`, `fetch_skill_files`, `list_skills`.

### Configuração no Cursor

Com `npx`:

```json
{
  "mcpServers": {
    "skills-pw2c": {
      "command": "npx",
      "args": ["skills-pw2c", "mcp"]
    }
  }
}
```

Com pacote instalado globalmente:

```json
{
  "mcpServers": {
    "skills-pw2c": {
      "command": "skills-pw2c",
      "args": ["mcp"]
    }
  }
}
```

## Catálogo

O pacote inclui um catálogo de skills em `skills/`. Use `skills-pw2c skill list` para ver as instaladas e o MCP para descobrir as disponíveis.

| id                           | nome                         | categoria | descrição                                                                                                                          |
| ---------------------------- | ---------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `example-skill`              | Example Skill                | testing   | Skill inicial para validar instalação, atualização e descoberta via MCP.                                                           |
| `docs-writer`                | Docs Writer                  | document  | Escreva, revise e edite arquivos de documentação estruturada.                                                                      |
| `story-architect`            | Story Architect              | document  | Arquiteto de Requisitos e Librarian: planeja, fatia e documenta User Stories com metadados para o LightRAG.                        |
| `pw2c-knowledge-base`        | PW2C Knowledge Base          | document  | Consulta e envia conhecimento à base PW2C (LightRAG). Use ao planejar, antes de codar ou ao consultar/indexar a base.              |
| `component-architect`        | Component Architect          | frontend  | Especialista em engenharia de componentes React/Next.js com foco em DRY, reutilização e padrões SOLID.                             |
| `component-architect-memory` | Component Architect (Memory) | frontend  | Como o Component Architect, com memória técnica (LightRAG) para consulta e indexação de componentes, hooks e utils entre projetos. |

---

## Contribuidores

Instruções para quem desenvolve ou contribui no repositório.

### Stack

- TypeScript estrito
- ESM
- Commander para CLI
- Zod para validação
- MCP TypeScript SDK
- Vitest para testes
- ESLint + Prettier
- Changesets para release

### Instalação local

```bash
npm install
npm run build
```

### Desenvolvimento

```bash
npm run dev -- skill list
npm run dev -- skill install example-skill
```

Comandos da CLI em modo dev (sem instalar o pacote):

```bash
npm run dev -- skill install example-skill
npm run dev -- skill uninstall example-skill
npm run dev -- skill list
npm run dev -- skill update example-skill
npm run dev -- skill update --all
```

### Catálogo de skills (estrutura)

O catálogo fica em `skills/`:

```text
skills/
  registry.json
  testing/
    example-skill/
      skill.json
      SKILL.md
      templates/
      references/
```

Consulte [docs/adding-skills.md](docs/adding-skills.md) para o fluxo completo de cadastro de novas skills.

### Scripts

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run package:check
```

### Release e npm

O workflow de release usa Changesets e GitHub Actions. O fluxo faz **commit direto na `main`** (sem abrir PR), para funcionar mesmo quando a organização não permite que o GitHub Actions crie pull requests. Se essa permissão estiver habilitada (Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests"), você pode optar por usar a `changesets/action` com fluxo baseado em PR.

#### Como publicar uma nova versão

1. **Criar o changeset** — `npm run changeset`. Escolha o tipo de bump (patch, minor, major) e escreva o resumo das mudanças (entra no CHANGELOG).
2. **Commitar e enviar** — commit do arquivo em `.changeset/` (e das suas alterações) e push na `main`.
3. **CI** — na `main`, o workflow valida (lint, typecheck, testes, build), aplica os changesets (atualiza `package.json` e CHANGELOG), faz commit e push do bump na própria `main` e publica no npm.

Você **não** precisa alterar o `version` no `package.json` manualmente, nem rodar `version-packages` ou `release` localmente; a pipeline faz isso.

Antes do primeiro publish, confirme:

1. o repositório existe em `healthdevio/skills-pw2c`
2. o `package.json` está com o nome correto do pacote (`skills-pw2c`)
3. o secret `NPM_TOKEN` está configurado na organização/repositório para a publicação no npm

### Testes

Os testes cobrem:

- carregamento e validação do registry
- instalação, remoção e atualização de skills
- execução da CLI
- ferramentas do MCP em memória
