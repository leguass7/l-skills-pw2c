import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  distCliExists,
  getDistCliPath,
  repoRoot,
  runDistCli,
} from "./helpers.js";

const tempDirs: string[] = [];

async function createVault(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "e2e-pm-lint-"));
  tempDirs.push(root);
  const epic = join(root, "Epics", "EPIC 01 - E");
  const storyDir = join(epic, "Stories", "STORY 01 - S");
  const taskDir = join(storyDir, "Tasks", "TASK 01 - T");
  const subDir = join(taskDir, "Subtasks");
  await mkdir(subDir, { recursive: true });
  await writeFile(join(storyDir, "STORY 01 - S.md"), "# story\n", "utf8");
  await writeFile(
    join(taskDir, "TASK 01 - T.md"),
    "Ver [[STORY 01 - S]]\n",
    "utf8",
  );
  await writeFile(join(subDir, "SUBTASK 01 - Work.md"), "ok\n", "utf8");
  return root;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((d) => rm(d, { recursive: true, force: true })),
  );
});

describe("e2e: skills-pw2c pm-lint (dist/cli.js)", () => {
  beforeAll(async () => {
    const ok = await distCliExists();
    if (!ok) {
      throw new Error(
        `E2E requer build: não encontrado ${getDistCliPath()}. Corra: npm run build`,
      );
    }
  });

  it("pm-lint --help imprime ajuda e sai 0", () => {
    const { code, stdout } = runDistCli(["pm-lint", "--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("pm-lint");
    expect(stdout).toContain("--root");
  });

  it("pm-lint num vault válido sai 0", async () => {
    const root = await createVault();
    const { code, stderr } = runDistCli(["pm-lint", "--root", root]);
    expect(code).toBe(0);
    expect(stderr).toContain("Sem problemas");
  });

  it("pm-lint deteta wikilink quebrado e sai 1", async () => {
    const root = await mkdtemp(join(tmpdir(), "e2e-pm-lint-bad-"));
    tempDirs.push(root);
    await writeFile(join(root, "x.md"), "[[Inexistente]]\n", "utf8");
    const { code, stderr } = runDistCli(["pm-lint", "--root", root]);
    expect(code).toBe(1);
    expect(stderr).toContain("Inexistente");
  });

  it("pm-lint --json devolve JSON com issues e exitCode", async () => {
    const root = await mkdtemp(join(tmpdir(), "e2e-pm-lint-json-"));
    tempDirs.push(root);
    await writeFile(join(root, "a.md"), "[[Ghost]]\n", "utf8");
    const { code, stdout } = runDistCli(["pm-lint", "--root", root, "--json"]);
    expect(code).toBe(1);
    const parsed = JSON.parse(stdout) as {
      root: string;
      exitCode: number;
      issues: unknown[];
    };
    expect(parsed.exitCode).toBe(1);
    expect(parsed.root).toBe(root);
    expect(Array.isArray(parsed.issues)).toBe(true);
    expect(parsed.issues.length).toBeGreaterThan(0);
  });

  it("pm-lint --fix corrige wikilink com casing e termina 0", async () => {
    const root = await mkdtemp(join(tmpdir(), "e2e-pm-lint-fix-"));
    tempDirs.push(root);
    await writeFile(join(root, "Alvo.md"), "# ok\n", "utf8");
    await writeFile(join(root, "b.md"), "X [[alvo]]\n", "utf8");
    const { code: code1 } = runDistCli(["pm-lint", "--root", root]);
    expect(code1).toBe(1);

    const { code: code2 } = runDistCli(["pm-lint", "--root", root, "--fix"]);
    expect(code2).toBe(0);

    const text = await readFile(join(root, "b.md"), "utf8");
    expect(text).toContain("[[Alvo]]");
  });

  it("invocação igual ao binário publicado (node dist/cli.js)", () => {
    const { code, stdout } = runDistCli(["--help"], { cwd: repoRoot });
    expect(code).toBe(0);
    expect(stdout).toContain("skills-pw2c");
  });
});
