import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import { checkNaming, namingPatterns, toPosix } from "../src/pm-lint/naming.js";
import { extractLinks } from "../src/pm-lint/parse.js";
import {
  buildNoteIndex,
  findCanonicalWikilinkTitle,
} from "../src/pm-lint/resolve.js";
import { runPmLint } from "../src/pm-lint/run.js";

async function createTempRoot(): Promise<string> {
  return mkdtemp(join(tmpdir(), "pm-lint-"));
}

describe("pm-lint naming", () => {
  it("rejeita colchetes no caminho", () => {
    const issues = checkNaming("Epics/EPIC 01 - X/Stories/[bad]/x.md");
    expect(issues.some((i) => i.message.includes("[ ou ]"))).toBe(true);
  });

  it("aceita Subtask com código UST no nome", () => {
    const ok = namingPatterns.SUBTASK_FILE.test("SUBTASK P.1 - Fazer algo.md");
    expect(ok).toBe(true);
  });

  it("detecta Story com nome de ficheiro diferente da pasta", () => {
    const issues = checkNaming(
      "Epics/EPIC 01 - E/Stories/STORY 01 - S/STORY 02 - S.md",
    );
    expect(
      issues.some((i) => i.message.includes("mesmo nome que a pasta")),
    ).toBe(true);
  });

  it("aceita árvore mínima válida", () => {
    const p =
      "Epics/EPIC 01 - E/Stories/STORY 01 - S/Tasks/TASK 01 - T/Subtasks/SUBTASK 01 - U.md";
    const naming = checkNaming(p);
    const critical = naming.filter((i) => i.severity === "error");
    expect(critical).toHaveLength(0);
  });
});

describe("pm-lint parse", () => {
  it("extrai wikilinks e links Markdown", () => {
    const content = "Veja [a](b.md) e [[Nota]] e [[X|alias]].";
    const links = extractLinks(content);
    expect(links.length).toBe(3);
    expect(links[0]?.type).toBe("markdown");
    expect(links[1]?.type).toBe("wikilink");
    if (links[1]?.type === "wikilink") expect(links[1].title).toBe("Nota");
    expect(links[2]?.type).toBe("wikilink");
    if (links[2]?.type === "wikilink") {
      expect(links[2].title).toBe("X");
      expect(links[2].display).toBe("alias");
    }
  });
});

describe("pm-lint resolve / index", () => {
  it("marca títulos ambíguos por casing distinto", async () => {
    const root = await createTempRoot();
    try {
      await mkdir(join(root, "a"), { recursive: true });
      await mkdir(join(root, "b"), { recursive: true });
      await writeFile(join(root, "a", "Note.md"), "#", "utf8");
      await writeFile(join(root, "b", "note.md"), "#", "utf8");
      const index = await buildNoteIndex(root);
      expect(index.ambiguousLower.has("note")).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("findCanonicalWikilinkTitle corrige só o casing", async () => {
    const root = await createTempRoot();
    try {
      await writeFile(join(root, "Minha Nota.md"), "#", "utf8");
      const index = await buildNoteIndex(root);
      expect(findCanonicalWikilinkTitle(index, "minha nota")).toBe(
        "Minha Nota",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("pm-lint runPmLint", () => {
  it("reporta wikilink inexistente", async () => {
    const root = await createTempRoot();
    try {
      await writeFile(join(root, "a.md"), "[[Fantasma]]", "utf8");
      const result = await runPmLint({ rootAbs: root, fix: false });
      expect(result.exitCode).toBe(1);
      expect(
        result.issues.some(
          (i) => i.kind === "link" && i.message.includes("Fantasma"),
        ),
      ).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("corrige wikilink com casing incorreto (--fix)", async () => {
    const root = await createTempRoot();
    try {
      await writeFile(join(root, "Alvo.md"), "# ok", "utf8");
      await writeFile(join(root, "b.md"), "Ver [[alvo]]", "utf8");
      const result = await runPmLint({ rootAbs: root, fix: true });
      expect(result.filesWritten).toContain("b.md");
      const text = await readFile(join(root, "b.md"), "utf8");
      expect(text).toContain("[[Alvo]]");
      expect(result.exitCode).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("corrige link Markdown com casing incorreto (--fix)", async () => {
    const root = await createTempRoot();
    try {
      await writeFile(join(root, "Target.md"), "# t", "utf8");
      await writeFile(join(root, "page.md"), "L [x](./target.md)", "utf8");
      const result = await runPmLint({ rootAbs: root, fix: true });
      expect(result.filesWritten.length).toBeGreaterThan(0);
      const text = await readFile(join(root, "page.md"), "utf8");
      expect(text).toMatch(/Target\.md/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("aceita vault válido sem erros", async () => {
    const root = await createTempRoot();
    try {
      const epic = join(root, "Epics", "EPIC 01 - Epic");
      const storyDir = join(epic, "Stories", "STORY 01 - Story");
      const taskDir = join(storyDir, "Tasks", "TASK 01 - Task");
      const subDir = join(taskDir, "Subtasks");
      await mkdir(subDir, { recursive: true });
      await writeFile(
        join(storyDir, "STORY 01 - Story.md"),
        "# story\n",
        "utf8",
      );
      await writeFile(
        join(taskDir, "TASK 01 - Task.md"),
        "Ver [[STORY 01 - Story]]\n",
        "utf8",
      );
      await writeFile(join(subDir, "SUBTASK 01 - Work.md"), "ok\n", "utf8");
      const result = await runPmLint({ rootAbs: root, fix: false });
      const errors = result.issues.filter((i) => i.severity === "error");
      expect(errors).toHaveLength(0);
      expect(result.exitCode).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("pm-lint toPosix", () => {
  it("normaliza separadores no Windows", () => {
    expect(toPosix("a\\b\\c")).toBe("a/b/c");
  });
});
