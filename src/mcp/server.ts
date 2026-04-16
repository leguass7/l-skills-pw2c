import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { installSkillCommand } from "../commands/skill/install.js";
import { listSkillsCommand } from "../commands/skill/list.js";
import { getTargetListRows } from "../commands/skill/target-list.js";
import { uninstallSkillCommand } from "../commands/skill/uninstall.js";
import { updateSkillCommand } from "../commands/skill/update.js";
import type { CommonCommandOptions } from "../commands/types.js";
import type { RuntimeOptions } from "../core/config.js";
import { getPackageMetadata, resolvePaths } from "../core/config.js";
import {
  getSkillDescriptor,
  getSkillEntryPath,
  listSkillDescriptors,
  searchSkills,
} from "../core/registry.js";

async function collectDirectoryListing(
  directoryPath: string,
): Promise<string[]> {
  const entries = await readdir(directoryPath, {
    recursive: true,
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(directoryPath, join(entry.parentPath, entry.name)).replaceAll(
        "\\",
        "/",
      ),
    )
    .sort();
}

function mergeRuntimeOptions(
  defaults: CommonCommandOptions,
  overrides: RuntimeOptions,
): RuntimeOptions {
  return {
    projectDir: overrides.projectDir ?? defaults.projectDir,
    target: overrides.target ?? defaults.target,
    installDir: overrides.installDir ?? defaults.installDir,
    stateFile: overrides.stateFile ?? defaults.stateFile,
  };
}

export function createMcpServer(
  defaults: CommonCommandOptions = {},
): McpServer {
  const metadata = getPackageMetadata();
  const server = new McpServer({
    name: metadata.packageName,
    version: metadata.version,
  });

  const pathsSchema = z.object({
    projectDir: z.string().optional(),
    target: z.string().optional(),
    installDir: z.string().optional(),
    stateFile: z.string().optional(),
  });

  server.registerTool(
    "search_skills",
    {
      description: "Busca skills pelo catálogo local.",
      inputSchema: {
        query: z.string().optional(),
        ...pathsSchema.shape,
      },
    },
    async (args) => {
      const paths = resolvePaths(mergeRuntimeOptions(defaults, args));

      const skills = await searchSkills(paths.registryFile, args.query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              skills.map(({ entry, manifest }) => ({
                id: entry.id,
                name: entry.name,
                version: entry.version,
                category: entry.category,
                description: entry.description,
                tags: manifest.tags,
              })),
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "read_skill",
    {
      description: "Retorna o manifesto e o conteúdo principal de uma skill.",
      inputSchema: {
        skillId: z.string().min(1),
        ...pathsSchema.shape,
      },
    },
    async (args) => {
      const paths = resolvePaths(mergeRuntimeOptions(defaults, args));
      const descriptor = await getSkillDescriptor(
        paths.registryFile,
        args.skillId,
      );
      const skillMarkdown = await readFile(
        getSkillEntryPath(descriptor),
        "utf8",
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                manifest: descriptor.manifest,
                skillMarkdown,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "fetch_skill_files",
    {
      description: "Lista ou lê arquivos de uma skill específica.",
      inputSchema: {
        skillId: z.string().min(1),
        mode: z.enum(["list", "all"]).default("list"),
        ...pathsSchema.shape,
      },
    },
    async (args) => {
      const paths = resolvePaths(mergeRuntimeOptions(defaults, args));
      const descriptor = await getSkillDescriptor(
        paths.registryFile,
        args.skillId,
      );
      const files = await collectDirectoryListing(descriptor.sourceDir);

      if (args.mode === "list") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ files }, null, 2),
            },
          ],
        };
      }

      const contents = await Promise.all(
        files.map(async (relativePath) => ({
          path: relativePath,
          content: await readFile(
            join(descriptor.sourceDir, relativePath),
            "utf8",
          ),
        })),
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ files: contents }, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_skills",
    {
      description:
        "Lista todas as skills do catálogo local (metadados do registry).",
    },
    async () => {
      const paths = resolvePaths(mergeRuntimeOptions(defaults, {}));
      const descriptors = await listSkillDescriptors(paths.registryFile);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              descriptors.map(({ entry }) => entry),
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_targets",
    {
      description:
        "Lista os ids de target (--target), pastas raiz e se entram em --target all.",
    },
    () => {
      const rows = getTargetListRows();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "install_skill",
    {
      description:
        "Instala uma skill no projeto (equivalente a skill install). Use target para o agente (cursor, gemini, all, …).",
      inputSchema: {
        skillId: z.string().optional(),
        category: z.string().optional(),
        ...pathsSchema.shape,
      },
    },
    async (args) => {
      const opts: CommonCommandOptions = {
        ...mergeRuntimeOptions(defaults, args),
      };
      const withCategory =
        typeof args.category === "string"
          ? { ...opts, category: args.category }
          : opts;

      const result = await installSkillCommand(args.skillId, withCategory);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "uninstall_skill",
    {
      description:
        "Remove uma skill instalada (equivalente a skill uninstall).",
      inputSchema: {
        skillId: z.string().optional(),
        category: z.string().optional(),
        ...pathsSchema.shape,
      },
    },
    async (args) => {
      const opts: CommonCommandOptions = {
        ...mergeRuntimeOptions(defaults, args),
      };
      const withCategory =
        typeof args.category === "string"
          ? { ...opts, category: args.category }
          : opts;

      const result = await uninstallSkillCommand(args.skillId, withCategory);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "update_skill",
    {
      description:
        "Atualiza uma skill instalada ou todas (equivalente a skill update).",
      inputSchema: {
        skillId: z.string().optional(),
        all: z.boolean().optional(),
        ...pathsSchema.shape,
      },
    },
    async (args) => {
      const result = await updateSkillCommand(args.skillId, {
        ...mergeRuntimeOptions(defaults, args),
        all: args.all === true,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_installed_skills",
    {
      description:
        "Lista skills do catálogo com estado instalado/não instalado para o target (equivalente a skill list).",
      inputSchema: {
        query: z.string().optional(),
        installed: z.boolean().optional(),
        available: z.boolean().optional(),
        ...pathsSchema.shape,
      },
    },
    async (args) => {
      const result = await listSkillsCommand(args.query, {
        ...mergeRuntimeOptions(defaults, args),
        installed: args.installed === true,
        available: args.available === true,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  return server;
}

export async function startMcpServer(
  defaults: CommonCommandOptions = {},
): Promise<void> {
  const server = createMcpServer(defaults);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
