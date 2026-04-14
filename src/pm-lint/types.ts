/** Resultado de uma execução do pm-lint. */
export type PmLintResult = {
  issues: PmLintIssue[];
  /** Ficheiros alterados (só com `--fix`). */
  filesWritten: string[];
  /** Código de saída sugerido (0 = sem erros bloqueantes). */
  exitCode: number;
};

export type PmLintIssue = NamingIssue | LinkIssue;

export type NamingIssue = {
  kind: "naming";
  severity: "error" | "warn";
  /** Caminho POSIX relativo à raiz `docs/project-manager`. */
  path: string;
  message: string;
};

export type LinkIssue = {
  kind: "link";
  severity: "error" | "warn";
  /** Ficheiro onde o link aparece (POSIX relativo à raiz). */
  file: string;
  line: number;
  column: number;
  /** Texto do alvo (href ou título wikilink). */
  target: string;
  message: string;
  linkType: "markdown" | "wikilink";
  /** Intervalo no texto do ficheiro (UTF-16 offsets) para `--fix`. */
  range?: { start: number; end: number };
  /** Substituição sugerida (texto completo no intervalo, ex. `](correto.md)` ou `[[Nome Canónico]]`). */
  replacement?: string;
};
