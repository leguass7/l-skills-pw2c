import { basename } from "node:path";

import type { NamingIssue } from "./types.js";

/** Segmentos reservados da árvore de backlog. */
const BACKLOG_SEGMENTS = new Set(["Epics", "Stories", "Tasks", "Subtasks"]);

const EPIC_DIR = /^EPIC \d{2} - .+$/;
const STORY_DIR = /^STORY \d{2} - .+$/;
const TASK_DIR = /^TASK \d{2} - .+$/;
/** Subtask: `SUBTASK 01 - …` ou `SUBTASK P.1 - …` */
const SUBTASK_FILE = /^SUBTASK (?:(?:\d{2})|(?:[A-Z]\.\d+)) - .+\.md$/;
const STORY_MD = /^STORY \d{2} - .+\.md$/;
const TASK_MD = /^TASK \d{2} - .+\.md$/;
const EPIC_MD = /^EPIC \d{2} - .+\.md$/;

/** Ficheiros na raiz de `docs/project-manager` que não seguem `NN-*.md`. */
const ROOT_MD_ALLOWLIST = new Set(["README.md", ".gitkeep", "CHANGELOG.md"]);

function hasBrackets(segment: string): boolean {
  return segment.includes("[") || segment.includes("]");
}

/**
 * Valida convenções de nomes sob `docs/project-manager`.
 * Regras mais estritas dentro de `Epics/**`.
 */
export function checkNaming(relativePosixPath: string): NamingIssue[] {
  const issues: NamingIssue[] = [];
  const segments = relativePosixPath.split("/").filter(Boolean);

  for (const seg of segments) {
    if (hasBrackets(seg)) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `Segmento com [ ou ] no nome (proibido pela convenção): "${seg}"`,
      });
    }
  }

  const inEpics = segments.includes("Epics");
  if (!inEpics) {
    // Raiz: aviso se .md sem prefixo NN- (exceto allowlist)
    if (segments.length === 1 && segments[0]?.endsWith(".md")) {
      const file = segments[0];
      if (!file) return issues;
      if (!ROOT_MD_ALLOWLIST.has(file) && !/^\d{2}-.+\.md$/.test(file)) {
        issues.push({
          kind: "naming",
          severity: "warn",
          path: relativePosixPath,
          message:
            "Ficheiro na raiz sem prefixo `NN-` (ex.: `00-Controle_de_Specs.md`). Ignorar se for exceção intencional.",
        });
      }
    }
    return issues;
  }

  // Dentro de Epics: validar cada nível
  const epicIdx = segments.indexOf("Epics");
  const afterEpics = segments.slice(epicIdx + 1);
  if (afterEpics.length === 0) return issues;

  // Epics/EPIC NN - …
  const epicSeg = afterEpics[0];
  if (epicSeg && !BACKLOG_SEGMENTS.has(epicSeg)) {
    if (!EPIC_DIR.test(epicSeg)) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `Pastas de Epic devem coincidir com \`EPIC NN - Título\` (recebido: "${epicSeg}")`,
      });
    }
  }

  // Stories/STORY NN - …
  const storiesIdx = afterEpics.indexOf("Stories");
  if (storiesIdx >= 0 && storiesIdx + 1 < afterEpics.length) {
    const storySeg = afterEpics[storiesIdx + 1];
    if (
      storySeg &&
      !BACKLOG_SEGMENTS.has(storySeg) &&
      !STORY_DIR.test(storySeg)
    ) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `Pastas de Story devem coincidir com \`STORY NN - Título\` (recebido: "${storySeg}")`,
      });
    }
  }

  // Tasks/TASK NN - …
  const tasksIdx = afterEpics.indexOf("Tasks");
  if (tasksIdx >= 0 && tasksIdx + 1 < afterEpics.length) {
    const taskSeg = afterEpics[tasksIdx + 1];
    if (taskSeg && !BACKLOG_SEGMENTS.has(taskSeg) && !TASK_DIR.test(taskSeg)) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `Pastas de Task devem coincidir com \`TASK NN - Título\` (recebido: "${taskSeg}")`,
      });
    }
  }

  const leaf = segments[segments.length - 1];
  if (!leaf?.endsWith(".md")) return issues;

  const parentSeg = segments.length >= 2 ? segments[segments.length - 2] : "";

  // Ficheiro .md dentro da pasta Story (irmão de Tasks/)
  if (parentSeg && STORY_DIR.test(parentSeg) && STORY_MD.test(leaf)) {
    const base = leaf.replace(/\.md$/u, "");
    if (base !== parentSeg) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `O ficheiro principal da Story deve ter o mesmo nome que a pasta: esperado "${parentSeg}.md", encontrado "${leaf}"`,
      });
    }
  }

  // Ficheiro .md dentro da pasta Task (irmão de Subtasks/)
  if (parentSeg && TASK_DIR.test(parentSeg) && TASK_MD.test(leaf)) {
    const base = leaf.replace(/\.md$/u, "");
    if (base !== parentSeg) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `O ficheiro principal da Task deve ter o mesmo nome que a pasta: esperado "${parentSeg}.md", encontrado "${leaf}"`,
      });
    }
  }

  // Epic opcional: EPIC …/EPIC ….md
  if (parentSeg && EPIC_DIR.test(parentSeg) && EPIC_MD.test(leaf)) {
    const base = leaf.replace(/\.md$/u, "");
    if (base !== parentSeg) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `Ficheiro do Epic, se existir, deve ter o mesmo nome que a pasta: esperado "${parentSeg}.md", encontrado "${leaf}"`,
      });
    }
  }

  // Subtasks/*.md
  if (parentSeg === "Subtasks") {
    if (!SUBTASK_FILE.test(leaf)) {
      issues.push({
        kind: "naming",
        severity: "error",
        path: relativePosixPath,
        message: `Subtask deve seguir \`SUBTASK NN - …\` ou \`SUBTASK P.1 - …\` (recebido: "${leaf}")`,
      });
    }
  }

  return issues;
}

/** Expõe padrões para testes e documentação. */
export const namingPatterns = {
  EPIC_DIR,
  STORY_DIR,
  TASK_DIR,
  SUBTASK_FILE,
  STORY_MD,
  TASK_MD,
  EPIC_MD,
  ROOT_MD_ALLOWLIST,
  BACKLOG_SEGMENTS,
};

/**
 * Converte caminho do SO para POSIX (para relatórios estáveis em Windows).
 */
export function toPosix(p: string): string {
  return p.replace(/\\/gu, "/");
}

/**
 * Nome do ficheiro sem extensão (último segmento).
 */
export function fileStem(relativePosixPath: string): string {
  const base = basename(relativePosixPath);
  return base.replace(/\.md$/iu, "");
}
