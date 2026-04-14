import { readdir } from "node:fs/promises";
import { join, normalize, relative, resolve, sep } from "node:path";

import { toPosix } from "./naming.js";

/**
 * Resolve um caminho absoluto tentando igualar cada componente ao disco com
 * correspondência só de maiúsculas/minúsculas (útil em repos com casing inconsistente).
 */
export async function resolveCaseInsensitivePath(
  targetAbs: string,
  rootAbs: string,
): Promise<string | null> {
  const normTarget = normalize(targetAbs);
  const normRoot = normalize(rootAbs);
  if (normTarget === normRoot) return normTarget;
  const rel = relative(normRoot, normTarget);
  if (rel.startsWith("..") || relative(normRoot, normTarget).includes("..")) {
    return null;
  }
  const parts = rel.split(sep).filter(Boolean);
  let current = normRoot;
  for (const part of parts) {
    let entries: string[];
    try {
      entries = await readdir(current);
    } catch {
      return null;
    }
    const found = entries.find((e) => e.toLowerCase() === part.toLowerCase());
    if (!found) return null;
    current = join(current, found);
  }
  return current;
}

export type NoteIndex = {
  /** Título exato (basename sem .md) → caminho POSIX relativo ao root do project-manager. */
  byExactTitle: Map<string, string>;
  /** Títulos em minúsculas com 2+ ficheiros `.md` (homónimos / casing). */
  ambiguousLower: Set<string>;
};

/**
 * Constrói índice de notas `.md` recursivo sob `rootAbs`.
 */
export async function buildNoteIndex(
  rootAbs: string,
  relativeBase = "",
): Promise<NoteIndex> {
  const byExactTitle = new Map<string, string>();
  /** Contagem por título em minúsculas (deteta homónimos com casing diferente). */
  const countsLower = new Map<string, number>();

  async function walk(dirAbs: string, relPosix: string): Promise<void> {
    const entries = await readdir(dirAbs, { withFileTypes: true });
    for (const ent of entries) {
      const name = ent.name;
      const childRel = relPosix ? `${relPosix}/${name}` : name;
      if (ent.isDirectory()) {
        await walk(join(dirAbs, name), childRel);
      } else if (ent.isFile() && name.toLowerCase().endsWith(".md")) {
        const stem = name.replace(/\.md$/iu, "");
        const posix = toPosix(childRel);
        const lower = stem.toLowerCase();
        countsLower.set(lower, (countsLower.get(lower) ?? 0) + 1);
        if (!byExactTitle.has(stem)) {
          byExactTitle.set(stem, posix);
        }
      }
    }
  }

  await walk(rootAbs, relativeBase);

  const ambiguousLower = new Set<string>();
  for (const [lower, n] of countsLower) {
    if (n > 1) ambiguousLower.add(lower);
  }

  return { byExactTitle, ambiguousLower };
}

/** Procura título de nota com correspondência só de maiúsculas/minúsculas. */
export function findCanonicalWikilinkTitle(
  index: NoteIndex,
  title: string,
): string | null {
  const stripped = title.replace(/\.md$/iu, "").trim();
  if (index.byExactTitle.has(stripped)) return stripped;
  for (const [k] of index.byExactTitle) {
    if (k.toLowerCase() === stripped.toLowerCase()) return k;
  }
  return null;
}

/**
 * Resolve href relativo a partir do diretório do ficheiro e da raiz do lint.
 */
export function resolveMarkdownHref(
  fileDirAbs: string,
  hrefRaw: string,
): string {
  const pathPart = hrefRaw.split("#")[0]?.trim() ?? "";
  if (
    pathPart === "" ||
    pathPart.startsWith("http:") ||
    pathPart.startsWith("https:") ||
    pathPart.startsWith("mailto:") ||
    pathPart.startsWith("tel:")
  ) {
    return "";
  }
  return resolve(fileDirAbs, pathPart);
}
