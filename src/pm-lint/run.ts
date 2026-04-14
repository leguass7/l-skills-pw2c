import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, normalize, relative } from "node:path";

import { checkNaming, toPosix } from "./naming.js";
import { extractLinks, offsetToLineColumn } from "./parse.js";
import type {
  LinkIssue,
  NamingIssue,
  PmLintIssue,
  PmLintResult,
} from "./types.js";
import {
  buildNoteIndex,
  findCanonicalWikilinkTitle,
  resolveCaseInsensitivePath,
  resolveMarkdownHref,
} from "./resolve.js";
import type { NoteIndex } from "./resolve.js";

async function* walkMarkdownFiles(dirAbs: string): AsyncGenerator<string> {
  const entries = await readdir(dirAbs, { withFileTypes: true });
  for (const ent of entries) {
    const p = join(dirAbs, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      yield* walkMarkdownFiles(p);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
      yield p;
    }
  }
}

function isBlocking(issue: PmLintIssue): boolean {
  return issue.severity === "error";
}

async function lintLinksInFile(
  fileAbs: string,
  rootAbs: string,
  content: string,
  index: NoteIndex,
): Promise<LinkIssue[]> {
  const issues: LinkIssue[] = [];
  const relPosix = toPosix(relative(rootAbs, fileAbs));
  const fileDirAbs = dirname(fileAbs);
  const links = extractLinks(content);

  for (const link of links) {
    if (link.type === "markdown") {
      const trimmed = link.href.trim();
      const hashIdx0 = trimmed.indexOf("#");
      const raw = hashIdx0 >= 0 ? trimmed.slice(0, hashIdx0) : trimmed;
      if (
        raw === "" ||
        raw.startsWith("http:") ||
        raw.startsWith("https:") ||
        raw.startsWith("mailto:") ||
        raw.startsWith("tel:") ||
        raw.startsWith("//")
      ) {
        continue;
      }
      if (raw.startsWith("/") && !raw.startsWith("//")) {
        const { line, column } = offsetToLineColumn(content, link.start);
        issues.push({
          kind: "link",
          severity: "warn",
          file: relPosix,
          line,
          column,
          target: raw,
          message:
            "Link Markdown com caminho absoluto POSIX (`/...`); não foi validado em relação ao vault.",
          linkType: "markdown",
        });
        continue;
      }
      const pathPart = raw;
      const hashSuffix = hashIdx0 >= 0 ? trimmed.slice(hashIdx0) : "";

      const resolved = resolveMarkdownHref(fileDirAbs, pathPart);
      if (resolved === "") continue;

      const pushMarkdownCaseFix = (absOnDisk: string, message: string) => {
        const relFixed = toPosix(relative(fileDirAbs, absOnDisk)).replace(
          /\\/gu,
          "/",
        );
        const newHref = relFixed + hashSuffix;
        const { line, column } = offsetToLineColumn(content, link.start);
        const isImage = link.start > 0 && content[link.start - 1] === "!";
        const prefix = isImage ? "!" : "";
        issues.push({
          kind: "link",
          severity: "error",
          file: relPosix,
          line,
          column,
          target: pathPart,
          message,
          linkType: "markdown",
          range: { start: link.start, end: link.end },
          replacement: `${prefix}[${link.label}](${newHref})`,
        });
      };

      try {
        await stat(resolved);
        const parentDir = dirname(resolved);
        const seg = basename(resolved);
        const entries = await readdir(parentDir);
        const canonical = entries.find(
          (e) => e.toLowerCase() === seg.toLowerCase(),
        );
        if (canonical !== undefined && canonical !== seg) {
          pushMarkdownCaseFix(
            join(parentDir, canonical),
            `Link Markdown com casing diferente do ficheiro no disco: "${pathPart}" → "${toPosix(relative(fileDirAbs, join(parentDir, canonical))).replace(/\\/gu, "/")}"`,
          );
        }
        continue;
      } catch {
        const ci = await resolveCaseInsensitivePath(resolved, rootAbs);
        if (ci) {
          pushMarkdownCaseFix(
            ci,
            `Link Markdown partido; existe com outro casing: "${pathPart}" → "${toPosix(relative(fileDirAbs, ci)).replace(/\\/gu, "/")}"`,
          );
          continue;
        }
        const { line, column } = offsetToLineColumn(content, link.start);
        issues.push({
          kind: "link",
          severity: "error",
          file: relPosix,
          line,
          column,
          target: pathPart,
          message: `Link Markdown aponta para ficheiro inexistente: "${pathPart}"`,
          linkType: "markdown",
        });
      }
      continue;
    }

    // wikilink
    const title = link.title.trim().replace(/\.md$/iu, "");
    if (title === "") continue;

    if (index.ambiguousLower.has(title.toLowerCase())) {
      const { line, column } = offsetToLineColumn(content, link.start);
      issues.push({
        kind: "link",
        severity: "warn",
        file: relPosix,
        line,
        column,
        target: title,
        message: `Wikilink ambíguo: o título "${title}" corresponde a mais do que um ficheiro .md`,
        linkType: "wikilink",
      });
      continue;
    }

    const canonical = findCanonicalWikilinkTitle(index, title);
    if (canonical === null) {
      const { line, column } = offsetToLineColumn(content, link.start);
      issues.push({
        kind: "link",
        severity: "error",
        file: relPosix,
        line,
        column,
        target: title,
        message: `Wikilink sem ficheiro correspondente: "[[${title}]]"`,
        linkType: "wikilink",
      });
      continue;
    }

    if (canonical !== title) {
      const { line, column } = offsetToLineColumn(content, link.start);
      const newInner = link.display
        ? `${canonical}|${link.display}`
        : canonical;
      issues.push({
        kind: "link",
        severity: "error",
        file: relPosix,
        line,
        column,
        target: title,
        message: `Wikilink com casing diferente do ficheiro: "${title}" → "${canonical}"`,
        linkType: "wikilink",
        range: { start: link.start, end: link.end },
        replacement: `[[${newInner}]]`,
      });
    }
  }

  return issues;
}

function applyReplacements(
  content: string,
  replacements: { start: number; end: number; text: string }[],
): string {
  const sorted = [...replacements].sort((a, b) => b.start - a.start);
  let out = content;
  for (const r of sorted) {
    out = out.slice(0, r.start) + r.text + out.slice(r.end);
  }
  return out;
}

export type RunPmLintOptions = {
  rootAbs: string;
  fix: boolean;
};

export async function runPmLint(
  options: RunPmLintOptions,
): Promise<PmLintResult> {
  const rootAbs = normalize(options.rootAbs);
  const issues: PmLintIssue[] = [];
  const filesWritten: string[] = [];

  await stat(rootAbs).catch(() => {
    throw new Error(`Raiz não existe ou não é acessível: ${rootAbs}`);
  });

  const index = await buildNoteIndex(rootAbs);

  for await (const fileAbs of walkMarkdownFiles(rootAbs)) {
    const relPosix = toPosix(relative(rootAbs, fileAbs));
    issues.push(...checkNaming(relPosix).map((n: NamingIssue) => n));

    const content = await readFile(fileAbs, "utf8");
    issues.push(...(await lintLinksInFile(fileAbs, rootAbs, content, index)));
  }

  const fixable = issues.filter(
    (i): i is LinkIssue =>
      i.kind === "link" && i.range !== undefined && i.replacement !== undefined,
  );

  if (options.fix && fixable.length > 0) {
    const byFile = new Map<string, LinkIssue[]>();
    for (const issue of fixable) {
      const list = byFile.get(issue.file) ?? [];
      list.push(issue);
      byFile.set(issue.file, list);
    }

    for (const [relFile, list] of byFile) {
      const fileAbs = join(rootAbs, ...relFile.split("/"));
      let content = await readFile(fileAbs, "utf8");
      const reps = list
        .filter((i) => i.range !== undefined && i.replacement !== undefined)
        .map((i) => ({
          start: i.range!.start,
          end: i.range!.end,
          text: i.replacement!,
        }));
      content = applyReplacements(content, reps);
      await writeFile(fileAbs, content, "utf8");
      filesWritten.push(relFile);
    }

    // Re-executar lint (sem segundo write) para relatório limpo
    const indexAfter = await buildNoteIndex(rootAbs);
    const issuesAfter: PmLintIssue[] = [];
    for await (const fileAbs of walkMarkdownFiles(rootAbs)) {
      const relPosix = toPosix(relative(rootAbs, fileAbs));
      issuesAfter.push(...checkNaming(relPosix));
      const c = await readFile(fileAbs, "utf8");
      issuesAfter.push(
        ...(await lintLinksInFile(fileAbs, rootAbs, c, indexAfter)),
      );
    }
    const exitCode = issuesAfter.some(isBlocking) ? 1 : 0;
    return { issues: issuesAfter, filesWritten, exitCode };
  }

  const exitCode = issues.some(isBlocking) ? 1 : 0;
  return { issues, filesWritten, exitCode };
}
