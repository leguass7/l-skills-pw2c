import { listAgentTargetDescriptors } from "../../core/agent-targets.js";

export interface TargetListRow {
  id: string;
  root: string | null;
  includedInAll: boolean;
  description?: string;
}

export function getTargetListRows(): TargetListRow[] {
  return listAgentTargetDescriptors().map((d) => ({
    id: d.id,
    root: d.root,
    includedInAll: d.includedInAll,
    ...(d.description !== undefined ? { description: d.description } : {}),
  }));
}

export function formatTargetListTable(rows: TargetListRow[]): string {
  const header = "id\troot\tincluído_em_all\tdescrição";
  const lines = rows.map((r) => {
    const root = r.root ?? "—";
    const inc = r.includedInAll ? "sim" : "não";
    const desc = r.description ?? "";
    return `${r.id}\t${root}\t${inc}\t${desc}`;
  });
  return [header, ...lines].join("\n") + "\n";
}
