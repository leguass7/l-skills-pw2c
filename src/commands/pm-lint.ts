import type { Command } from "commander";
import { resolve } from "node:path";

import type { CommandIo } from "./types.js";
import { runPmLint } from "../pm-lint/run.js";

export type PmLintCliOptions = {
  root: string;
  fix: boolean;
  json: boolean;
};

export function registerPmLintCommand(program: Command, io: CommandIo): void {
  program
    .command("pm-lint")
    .description(
      "Valida convenções de nomes e links (Markdown + wikilinks) em docs/project-manager.",
    )
    .option(
      "-r, --root <path>",
      "Pasta raiz (predefinido: ./docs/project-manager)",
      "docs/project-manager",
    )
    .option(
      "--fix",
      "Corrige automaticamente links com casing errado e wikilinks",
      false,
    )
    .option("--json", "Saída em JSON (stdout)", false)
    .action(async (opts: PmLintCliOptions) => {
      const rootAbs = resolve(process.cwd(), opts.root);
      const result = await runPmLint({ rootAbs, fix: opts.fix });

      if (opts.json) {
        io.stdout(
          `${JSON.stringify(
            {
              root: rootAbs,
              exitCode: result.exitCode,
              filesWritten: result.filesWritten,
              issues: result.issues,
            },
            null,
            2,
          )}\n`,
        );
        process.exitCode = result.exitCode;
        return;
      }

      if (result.filesWritten.length > 0) {
        io.stderr(
          `Corrigidos ${String(result.filesWritten.length)} ficheiro(s):\n${result.filesWritten.map((f) => `  - ${f}`).join("\n")}\n\n`,
        );
      }

      for (const issue of result.issues) {
        if (issue.kind === "naming") {
          io.stderr(`[${issue.severity}] ${issue.path}: ${issue.message}\n`);
        } else {
          io.stderr(
            `[${issue.severity}] ${issue.file}:${String(issue.line)}:${String(issue.column)} ${issue.linkType} → ${issue.target}\n  ${issue.message}\n`,
          );
        }
      }

      const n = result.issues.length;
      io.stderr(
        `\n${n === 0 ? "Sem problemas." : `${String(n)} problema(s) encontrado(s).`}\n`,
      );
      process.exitCode = result.exitCode;
    });
}
