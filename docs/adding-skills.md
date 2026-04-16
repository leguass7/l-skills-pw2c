# Adicionando novas skills

Este projeto foi estruturado para permitir que líderes técnicos adicionem novas skills sem tocar na arquitetura da CLI.

## Passo a passo

1. Crie uma pasta para a skill dentro de `skills/<categoria>/<skill-id>/`.
2. Adicione o arquivo `skill.json`.
3. Adicione o arquivo principal `SKILL.md`.
4. Se necessário, crie `templates/` e `references/`.
5. Registre a skill em `skills/registry.json`.
6. Atualize a seção **Catálogo** no [README.md](../README.md) com a nova skill: adicione uma linha na tabela com `id`, nome, categoria e descrição (resumida).
7. Rode validação local:

```bash
npm run lint
npm run typecheck
npm test
```

## Exemplo de manifesto

```json
{
  "id": "example-skill",
  "name": "Example Skill",
  "version": "0.1.0",
  "category": "testing",
  "description": "Skill inicial para validar instalação, atualização e descoberta via MCP.",
  "entry": "SKILL.md",
  "files": ["SKILL.md", "templates/template.md", "references/reference.md"],
  "tags": ["example", "testing", "cursor"],
  "compatibility": {
    "targets": ["cursor", "mcp"],
    "minimumCliVersion": "0.1.0"
  }
}
```

## Boas práticas

- Use `id` curto e estável.
- Mantenha `name`, `version`, `category` e `description` sincronizados com `skills/registry.json`.
- Prefira `SKILL.md` objetivo e operacional.
- Coloque material de apoio em `references/`.
- Coloque artefatos reutilizáveis em `templates/`.

## Convenção do registry

Cada entrada do `skills/registry.json` deve apontar para o `skill.json` correspondente:

```json
{
  "id": "example-skill",
  "name": "Example Skill",
  "version": "0.1.0",
  "category": "testing",
  "description": "Skill inicial para validar instalação, atualização e descoberta via MCP.",
  "manifestPath": "testing/example-skill/skill.json"
}
```

## Como a instalação funciona

Quando o dev roda:

```bash
l-skills-pw2c skill install example-skill
```

o conteúdo da pasta da skill é copiado para o preset **cursor**:

`<projeto>/.cursor/skills/example-skill`

O estado da instalação é salvo em:

`<projeto>/.cursor/l-skills-pw2c/state.json`

Para outro agente (Gemini, Claude Code, etc.), usa-se **`--target <id>`**; a CLI copia para `<projeto>/<root>/skills/<skill-id>` e mantém o estado em `<projeto>/<root>/l-skills-pw2c/state.json`, onde `<root>` depende do preset (ver `l-skills-pw2c skill target list` ou o módulo `src/core/agent-targets.ts`).

O servidor MCP expõe as mesmas operações (`install_skill`, `list_targets`, …) com os mesmos parâmetros de path e `target`.

## Evolução futura

A estrutura atual já suporta:

- múltiplas categorias
- dezenas de skills no mesmo pacote
- uso pela CLI e pelo MCP com o mesmo catálogo
- instalação por agente (`--target`) e meta-target `all` apenas em `skill install`
- futura extração para monorepo com pacote `core`, `cli` e `mcp` separados
