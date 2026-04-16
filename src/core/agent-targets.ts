import { join } from "node:path";

/** Meta-target: instala em todos os presets de `TARGETS_INCLUDED_IN_ALL`. */
export const META_TARGET_ALL = "all" as const;

export interface AgentTargetDescriptor {
  id: string;
  /** Pasta sob o projeto, ex.: `.cursor`. Inexistente para o meta-target `all`. */
  root: string | null;
  /** Incluído no `--target all` (instalação em lote). */
  includedInAll: boolean;
  /** Descrição curta para listagens. */
  description?: string;
}

const PRESETS: readonly AgentTargetDescriptor[] = [
  {
    id: "cursor",
    root: ".cursor",
    includedInAll: true,
    description: "Cursor (predefinição)",
  },
  {
    id: "claude",
    root: ".claude",
    includedInAll: true,
    description: "Claude Code / .claude",
  },
  {
    id: "gemini",
    root: ".gemini",
    includedInAll: true,
    description: "Gemini CLI",
  },
  {
    id: "codex",
    root: ".codex",
    includedInAll: true,
    description: "Codex",
  },
  {
    id: "openclaude",
    root: ".openclaude",
    includedInAll: true,
    description: "OpenClaude",
  },
  {
    id: "openclaw",
    root: ".openclaw",
    includedInAll: true,
    description: "OpenClaw",
  },
  {
    id: "agent",
    root: ".agent",
    includedInAll: false,
    description: "Genérico (.agent)",
  },
] as const;

const META_ALL_ROW: AgentTargetDescriptor = {
  id: META_TARGET_ALL,
  root: null,
  includedInAll: false,
  description: "Instala em todos os presets com includedInAll",
};

/** Ordem usada em `--target all` (exclui `agent` e o próprio `all`). */
export const TARGETS_INCLUDED_IN_ALL: readonly string[] = PRESETS.filter(
  (p) => p.includedInAll,
).map((p) => p.id);

const KNOWN_IDS = new Set<string>([
  ...PRESETS.map((p) => p.id),
  META_TARGET_ALL,
]);

export function listAgentTargetDescriptors(): AgentTargetDescriptor[] {
  return [...PRESETS, META_ALL_ROW];
}

export function normalizeTargetId(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === "") {
    return "cursor";
  }
  return raw.trim().toLowerCase();
}

export function isKnownTargetId(id: string): boolean {
  return KNOWN_IDS.has(normalizeTargetId(id));
}

export function assertKnownTarget(id: string): void {
  const n = normalizeTargetId(id);
  if (!KNOWN_IDS.has(n)) {
    throw new Error(
      `Target inválido '${id}'. Use um id conhecido (veja 'skill target list').`,
    );
  }
}

/**
 * Raiz do agente (ex. `.gemini`) ou `null` só para o meta-target `all`.
 */
export function getAgentRootForResolvableTarget(target: string): string | null {
  const n = normalizeTargetId(target);
  if (n === META_TARGET_ALL) {
    return null;
  }
  assertKnownTarget(n);
  const preset = PRESETS.find((p) => p.id === n);
  return preset?.root ?? null;
}

/** Lança se o target não puder ser usado para um único par install/state (ex.: `all`). */
export function assertResolvableTargetForPaths(target: string): void {
  const n = normalizeTargetId(target);
  assertKnownTarget(n);
  if (n === META_TARGET_ALL) {
    throw new Error(
      `O target '${META_TARGET_ALL}' não pode ser usado aqui. Indique um agente concreto ou use 'skill install' com --target all.`,
    );
  }
}

/** `all` só é válido em `skill install`. */
export function assertNotMetaAllForNonInstallCommands(
  target: string | undefined,
): void {
  if (normalizeTargetId(target ?? "") === META_TARGET_ALL) {
    throw new Error(
      `O target '${META_TARGET_ALL}' só é suportado em 'skill install'.`,
    );
  }
}

export function pathsFromAgentRoot(
  workspaceDir: string,
  agentRoot: string,
): { installDir: string; stateFile: string } {
  return {
    installDir: join(workspaceDir, agentRoot, "skills"),
    stateFile: join(workspaceDir, agentRoot, "l-skills-pw2c", "state.json"),
  };
}
