import { join } from "node:path";

import {
  META_TARGET_ALL,
  normalizeTargetId,
  TARGETS_INCLUDED_IN_ALL,
} from "../../core/agent-targets.js";
import { resolvePaths } from "../../core/config.js";
import { installSkill } from "../../core/installer.js";
import { getSkillIdsByCategory } from "../../core/registry.js";
import type { CommonCommandOptions } from "../types.js";

export interface InstallCommandResult {
  skillId: string;
  version: string;
  installPath: string;
}

export interface InstallByCategoryResult {
  category: string;
  results: InstallCommandResult[];
}

export interface InstallMultiTargetRow extends InstallCommandResult {
  target: string;
}

/** Uma skill instalada em vários targets (`--target all`). */
export interface InstallAllTargetsSingleResult {
  multiTargetInstall: true;
  skillId: string;
  results: InstallMultiTargetRow[];
}

/** Categoria instalada em vários targets (`--target all`). */
export interface InstallAllTargetsCategoryResult {
  multiTargetInstall: true;
  category: string;
  results: InstallMultiTargetRow[];
}

export type InstallCommandResultUnion =
  | InstallCommandResult
  | InstallByCategoryResult
  | InstallAllTargetsSingleResult
  | InstallAllTargetsCategoryResult;

function assertNoExplicitPathsForTargetAll(
  options: CommonCommandOptions,
): void {
  if (
    options.installDir !== undefined ||
    process.env.LPW2C_INSTALL_DIR ||
    options.stateFile !== undefined ||
    process.env.LPW2C_STATE_FILE
  ) {
    throw new Error(
      "Não combine --target all com --install-dir, --state-file ou as variáveis LPW2C_INSTALL_DIR / LPW2C_STATE_FILE.",
    );
  }
}

function runtimeForTarget(
  options: CommonCommandOptions,
  targetId: string,
): CommonCommandOptions {
  return {
    projectDir: options.projectDir,
    target: targetId,
  };
}

export async function installSkillCommand(
  skillId: string | undefined,
  options: CommonCommandOptions & { category?: string },
): Promise<InstallCommandResultUnion> {
  const normalizedTarget = normalizeTargetId(options.target);

  if (normalizedTarget === META_TARGET_ALL) {
    assertNoExplicitPathsForTargetAll(options);

    if (options.category !== undefined) {
      const firstPaths = resolvePaths(
        runtimeForTarget(options, TARGETS_INCLUDED_IN_ALL[0]!),
      );
      const ids = await getSkillIdsByCategory(
        firstPaths.registryFile,
        options.category,
      );
      const results: InstallMultiTargetRow[] = [];

      for (const t of TARGETS_INCLUDED_IN_ALL) {
        const paths = resolvePaths(runtimeForTarget(options, t));
        for (const id of ids) {
          const result = await installSkill(paths, id);
          results.push({
            target: t,
            skillId: result.record.id,
            version: result.record.version,
            installPath: join(paths.installDir, result.record.id),
          });
        }
      }

      return {
        multiTargetInstall: true,
        category: options.category,
        results,
      };
    }

    if (skillId === undefined) {
      throw new Error("Informe a skill ou use --category.");
    }

    const results: InstallMultiTargetRow[] = [];

    for (const t of TARGETS_INCLUDED_IN_ALL) {
      const paths = resolvePaths(runtimeForTarget(options, t));
      const result = await installSkill(paths, skillId);
      results.push({
        target: t,
        skillId: result.record.id,
        version: result.record.version,
        installPath: join(paths.installDir, result.record.id),
      });
    }

    return {
      multiTargetInstall: true,
      skillId,
      results,
    };
  }

  const paths = resolvePaths(options);

  if (options.category !== undefined) {
    const ids = await getSkillIdsByCategory(
      paths.registryFile,
      options.category,
    );
    const results: InstallCommandResult[] = [];

    for (const id of ids) {
      const result = await installSkill(paths, id);
      results.push({
        skillId: result.record.id,
        version: result.record.version,
        installPath: join(paths.installDir, result.record.id),
      });
    }

    return {
      category: options.category,
      results,
    };
  }

  if (skillId === undefined) {
    throw new Error("Informe a skill ou use --category.");
  }

  const result = await installSkill(paths, skillId);
  return {
    skillId: result.record.id,
    version: result.record.version,
    installPath: join(paths.installDir, result.record.id),
  };
}
