#!/usr/bin/env node
/**
 * Cria na lista ClickUp os campos do padrão UST a partir de:
 * scripts/codigo-ust-catalog.json (catálogo de opções "Código da UST") +
 * definições fixas dos outros 6 campos (ver SKILL.md / clickup-template.md).
 *
 * Antes de criar: GET /list/{list_id}/field — verifica se cada campo já existe;
 * para "Código da UST" compara o número de opções com o catálogo JSON.
 *
 * Variáveis de ambiente:
 *   CLICKUP_API_TOKEN (obrigatório)
 *   CLICKUP_LIST_ID (obrigatório)
 *   CLICKUP_FIELDS_JSON (opcional) — caminho para outro JSON (mesmo schema)
 *
 * Uso (na raiz do repo):
 *   CLICKUP_API_TOKEN=pk_... CLICKUP_LIST_ID=901322345272 node .cursor/skills/clickup-ust-template/scripts/sync-fields.mjs
 */

import { readFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API = "https://api.clickup.com/api/v2";

/** Os 6 campos além de "Código da UST" — nomes/tipos alinhados a clickup-template.md */
function buildDesiredFields(codigoOptions) {
  return [
    { name: "Complexidade da UST", type: "number", type_config: {} },
    {
      name: "Código da UST",
      type: "drop_down",
      type_config: {
        sorting: "manual",
        new_drop_down: true,
        options: codigoOptions,
      },
    },
    { name: "Fechado em", type: "date", type_config: {} },
    { name: "Quantidade de USTs", type: "number", type_config: {} },
    {
      name: "Status da documentação",
      type: "drop_down",
      type_config: {
        sorting: "manual",
        new_drop_down: true,
        options: [
          { name: "Feito", color: "#2ecd6f", orderindex: 0 },
          { name: "Pendente", color: "#e50000", orderindex: 1 },
        ],
      },
    },
    {
      name: "Status do faturamento",
      type: "drop_down",
      type_config: {
        sorting: "manual",
        new_drop_down: true,
        options: [
          { name: "A faturar", color: "#667684", orderindex: 0 },
          { name: "Faturado", color: "#2ecd6f", orderindex: 1 },
        ],
      },
    },
    { name: "Valor da UST", type: "number", type_config: {} },
  ];
}

function loadCodigoOptions(data) {
  if (
    Array.isArray(data.codigo_ust_options) &&
    data.codigo_ust_options.length > 0
  ) {
    return data.codigo_ust_options;
  }
  // Legado: export antigo com custom_fields[] completo
  if (Array.isArray(data.custom_fields)) {
    const codigoRef = data.custom_fields.find(
      (cf) => norm(cf.name).includes("Código") && norm(cf.name).includes("UST"),
    );
    const opts = codigoRef?.type_config?.options;
    if (Array.isArray(opts) && opts.length > 0) {
      return opts.map((o) => ({
        name: o.name,
        color: o.color,
        orderindex: o.orderindex,
      }));
    }
  }
  return null;
}

function norm(s) {
  if (s == null) return "";
  return String(s).normalize("NFC").trim();
}

function findField(fields, name) {
  const n = norm(name);
  let f = fields.find((x) => norm(x.name) === n);
  if (f) return f;
  if (n.includes("Código") && n.includes("UST")) {
    f = fields.find(
      (x) => norm(x.name).includes("Código") && norm(x.name).includes("UST"),
    );
  }
  return f;
}

function optionCount(field) {
  const opts = field?.type_config?.options;
  return Array.isArray(opts) ? opts.length : 0;
}

function optionNames(field) {
  const opts = field?.type_config?.options;
  if (!Array.isArray(opts)) return [];
  return opts.map((o) => norm(o.name));
}

function buildBody(cf) {
  switch (cf.type) {
    case "number":
      return { name: cf.name, type: "number" };
    case "date":
      return { name: cf.name, type: "date" };
    case "drop_down": {
      const options = (cf.type_config?.options ?? []).map((o) => ({
        name: o.name,
        color: o.color,
        orderindex: o.orderindex,
      }));
      return {
        name: cf.name,
        type: "drop_down",
        type_config: {
          sorting: cf.type_config?.sorting ?? "manual",
          new_drop_down: cf.type_config?.new_drop_down ?? true,
          options,
        },
      };
    }
    default:
      return null;
  }
}

function verifyStatusDoc(field) {
  const names = optionNames(field);
  const need = ["Feito", "Pendente"];
  const ok = need.every((n) => names.some((x) => x === n));
  return { ok, missing: ok ? [] : need.filter((n) => !names.includes(n)) };
}

function verifyStatusFat(field) {
  const names = optionNames(field);
  const need = ["A faturar", "Faturado"];
  const ok = need.every((n) => names.some((x) => x === n));
  return { ok, missing: ok ? [] : need.filter((n) => !names.includes(n)) };
}

async function fetchListFields(token, listId) {
  const res = await fetch(`${API}/list/${listId}/field`, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET field: ${res.status} ${text}`);
  const j = JSON.parse(text);
  return j.fields ?? [];
}

async function postField(token, listId, body) {
  const res = await fetch(`${API}/list/${listId}/field`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, status: res.status, text };
  return { ok: true, json: JSON.parse(text) };
}

function shouldSkipExisting(cf, ex) {
  const nm = norm(cf.name);
  if (cf.type !== ex.type) {
    console.error(
      "AVISO: mesmo nome ambíguo ou colisão — esperado",
      cf.type,
      "API tem",
      ex.type,
      ":",
      cf.name,
    );
    return true;
  }

  if (cf.type === "drop_down" && nm.includes("Código") && nm.includes("UST")) {
    const n = optionCount(ex);
    const need = (cf.type_config?.options ?? []).length;
    if (need > 0 && n >= need) {
      console.error(
        "SKIP (Código da UST OK):",
        cf.name,
        `opções=${n}/${need}`,
        ex.id,
      );
    } else if (n > 0) {
      console.error(
        "SKIP (Código da UST INCOMPLETO):",
        `opções=${n}`,
        `esperado>=${need}`,
        "— corrigir na UI ou remover o campo e voltar a correr.",
      );
    } else {
      console.error(
        "SKIP (Código da UST existe mas sem opções):",
        cf.name,
        ex.id,
      );
    }
    return true;
  }

  if (cf.type === "drop_down" && nm.includes("documentação")) {
    const v = verifyStatusDoc(ex);
    if (v.ok) {
      console.error("SKIP (Status da documentação OK):", cf.name);
      return true;
    }
    console.error(
      "SKIP (Status da documentação incompleto — UI):",
      v.missing.join(", "),
    );
    return true;
  }

  if (cf.type === "drop_down" && nm.includes("faturamento")) {
    const v = verifyStatusFat(ex);
    if (v.ok) {
      console.error("SKIP (Status do faturamento OK):", cf.name);
      return true;
    }
    console.error(
      "SKIP (Status do faturamento incompleto — UI):",
      v.missing.join(", "),
    );
    return true;
  }

  console.error("SKIP (já existe):", cf.name, ex.id);
  return true;
}

async function main() {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;
  if (!token || !listId) {
    console.error("Defina CLICKUP_API_TOKEN e CLICKUP_LIST_ID.");
    process.exit(1);
  }

  const defaultJson = join(__dirname, "codigo-ust-catalog.json");
  const jsonPath = resolve(
    process.cwd(),
    process.env.CLICKUP_FIELDS_JSON || defaultJson,
  );
  const raw = await readFile(jsonPath, "utf8");
  const data = JSON.parse(raw);
  const codigoOpts = loadCodigoOptions(data);
  if (!codigoOpts) {
    console.error(
      "JSON inválido: falta codigo_ust_options[] (ou legado custom_fields com Código da UST).",
    );
    process.exit(1);
  }

  const desired = buildDesiredFields(codigoOpts);
  const expectedCodigoOptions = codigoOpts.length;

  console.error(
    `VERIFICAÇÃO: referência JSON — Código da UST com ${expectedCodigoOptions} opções (${jsonPath})`,
  );

  const existing = await fetchListFields(token, listId);
  console.error(
    `VERIFICAÇÃO: lista ${listId} — ${existing.length} campo(s) na API.`,
  );

  const codigoEx = findField(existing, "Código da UST");
  const nCodigo = codigoEx ? optionCount(codigoEx) : 0;
  let codigoEstado = "AUSENTE";
  if (codigoEx) {
    if (expectedCodigoOptions > 0 && nCodigo >= expectedCodigoOptions) {
      codigoEstado = "OK";
    } else if (nCodigo > 0) {
      codigoEstado = "INCOMPLETO";
    } else {
      codigoEstado = "INCOMPLETO";
    }
  }
  console.error(
    `VERIFICAÇÃO: Código da UST | estado=${codigoEstado} | opções_destino=${nCodigo} | esperado_ref=${expectedCodigoOptions}`,
  );

  for (const cf of desired) {
    const body = buildBody(cf);
    if (!body) {
      console.warn("Ignorado (tipo):", cf.name, cf.type);
      continue;
    }

    const ex = findField(existing, cf.name);
    if (ex) {
      if (shouldSkipExisting(cf, ex)) {
        continue;
      }
    }

    const result = await postField(token, listId, body);
    if (!result.ok) {
      console.error("Falha:", cf.name, result.status, result.text);
      continue;
    }
    console.log("OK", result.json.field?.name, result.json.field?.id);
    if (result.json.field) existing.push(result.json.field);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
