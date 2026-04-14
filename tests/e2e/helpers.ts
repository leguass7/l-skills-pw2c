import { spawnSync } from "node:child_process";
import { access, constants } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Raiz do repositório skills-pw2c (…/tests/e2e → …/). */
export const repoRoot = join(__dirname, "..", "..");

const distCli = join(repoRoot, "dist", "cli.js");

export async function distCliExists(): Promise<boolean> {
  try {
    await access(distCli, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function getDistCliPath(): string {
  return distCli;
}

/**
 * Executa `node dist/cli.js <args...>` como subprocesso (E2E real).
 */
export function runDistCli(
  args: string[],
  options: { cwd?: string } = {},
): { code: number; stdout: string; stderr: string } {
  const cwd = options.cwd ?? repoRoot;
  const r = spawnSync(process.execPath, [distCli, ...args], {
    cwd,
    encoding: "utf8",
    shell: false,
  });
  const stdout = typeof r.stdout === "string" ? r.stdout : "";
  const stderr = typeof r.stderr === "string" ? r.stderr : "";
  const code = r.status === null ? 1 : r.status;
  return { code, stdout, stderr };
}
