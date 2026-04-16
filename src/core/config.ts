import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertKnownTarget,
  assertResolvableTargetForPaths,
  getAgentRootForResolvableTarget,
  normalizeTargetId,
} from "./agent-targets.js";

export interface RuntimeOptions {
  projectDir?: string | undefined;
  installDir?: string | undefined;
  stateFile?: string | undefined;
  /** Preset de agente (`cursor`, `gemini`, …). `LPW2C_TARGET` é usado se omitido. */
  target?: string | undefined;
}

export interface PackageMetadata {
  packageName: string;
  commandName: string;
  version: string;
  packageRoot: string;
}

export interface ResolvedPaths extends PackageMetadata {
  workspaceDir: string;
  installDir: string;
  stateFile: string;
  registryFile: string;
  skillsRoot: string;
}

interface RawPackageJson {
  name?: string;
  version?: string;
  bin?: Record<string, string> | string;
}

const currentDir = dirname(fileURLToPath(import.meta.url));

function findPackageRoot(startDirectory: string): string {
  let candidate = startDirectory;

  while (true) {
    if (existsSync(join(candidate, "package.json"))) {
      return candidate;
    }

    const parentDirectory = dirname(candidate);

    if (parentDirectory === candidate) {
      throw new Error("Não foi possível localizar o package.json do projeto.");
    }

    candidate = parentDirectory;
  }
}

const packageRoot = findPackageRoot(currentDir);

function loadPackageMetadata(): PackageMetadata {
  const packageJsonPath = join(packageRoot, "package.json");
  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, "utf8"),
  ) as RawPackageJson;

  const packageName = packageJson.name ?? "l-skills-pw2c";
  const commandName =
    typeof packageJson.bin === "string"
      ? (packageName.split("/").at(-1) ?? "l-skills-pw2c")
      : (Object.keys(packageJson.bin ?? {})[0] ?? "l-skills-pw2c");

  return {
    packageName,
    commandName,
    version: packageJson.version ?? "0.0.0",
    packageRoot,
  };
}

export function getPackageMetadata(): PackageMetadata {
  return loadPackageMetadata();
}

export function resolvePaths(options: RuntimeOptions = {}): ResolvedPaths {
  const metadata = getPackageMetadata();
  const workspaceDir = resolve(
    options.projectDir ?? process.env.LPW2C_PROJECT_DIR ?? process.cwd(),
  );

  const effectiveTarget = normalizeTargetId(
    options.target ?? process.env.LPW2C_TARGET,
  );
  assertKnownTarget(effectiveTarget);
  assertResolvableTargetForPaths(effectiveTarget);

  const installDirFromOptions = options.installDir !== undefined;
  const installDirFromEnv = process.env.LPW2C_INSTALL_DIR !== undefined;
  const explicitInstallDir = installDirFromOptions || installDirFromEnv;

  let installDir: string;
  if (installDirFromOptions) {
    installDir = resolve(options.installDir!);
  } else if (installDirFromEnv) {
    installDir = resolve(process.env.LPW2C_INSTALL_DIR!);
  } else {
    const root = getAgentRootForResolvableTarget(effectiveTarget);
    if (!root) {
      throw new Error("Invariante: target sem pasta raiz.");
    }
    installDir = resolve(join(workspaceDir, root, "skills"));
  }

  const stateFromOptions = options.stateFile !== undefined;
  const stateFromEnv = process.env.LPW2C_STATE_FILE !== undefined;

  let stateFile: string;
  if (stateFromOptions) {
    stateFile = resolve(options.stateFile!);
  } else if (stateFromEnv) {
    stateFile = resolve(process.env.LPW2C_STATE_FILE!);
  } else if (explicitInstallDir) {
    stateFile = resolve(
      join(dirname(installDir), "l-skills-pw2c", "state.json"),
    );
  } else {
    const root = getAgentRootForResolvableTarget(effectiveTarget);
    if (!root) {
      throw new Error("Invariante: target sem pasta raiz.");
    }
    stateFile = resolve(
      join(workspaceDir, root, "l-skills-pw2c", "state.json"),
    );
  }

  return {
    ...metadata,
    workspaceDir,
    installDir,
    stateFile,
    registryFile: join(metadata.packageRoot, "skills", "registry.json"),
    skillsRoot: join(metadata.packageRoot, "skills"),
  };
}

export function ensureParentDirectory(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
}

export function ensureDirectory(directoryPath: string): void {
  mkdirSync(directoryPath, { recursive: true });
}
