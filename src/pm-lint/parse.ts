/** Extrai links Markdown `[]()` e wikilinks `[[...]]` com posições UTF-16. */

export type ParsedMarkdownLink = {
  type: "markdown";
  start: number;
  end: number;
  /** Texto do link (parte entre [ e ]) */
  label: string;
  /** href bruto, sem processar */
  href: string;
};

export type ParsedWikilink = {
  type: "wikilink";
  start: number;
  end: number;
  /** Título da nota (antes de |) */
  title: string;
  /** Alias opcional (depois de |) */
  display?: string;
};

export type ParsedLink = ParsedMarkdownLink | ParsedWikilink;

const MD_LINK = /!?\[(?<label>[^\]]*)\]\((?<href>[^)]+)\)/gu;
const WIKILINK = /\[\[(?<t>[^\]|]+)(?:\|(?<d>[^\]]+))?\]\]/gu;

/**
 * Extrai ocorrências de links no conteúdo.
 */
function stripOptionalMdTitle(raw: string): string {
  return raw
    .trim()
    .replace(/\s+["'][^"']*["']\s*$/u, "")
    .trim();
}

export function extractLinks(content: string): ParsedLink[] {
  const out: ParsedLink[] = [];

  for (const m of content.matchAll(MD_LINK)) {
    const label = m.groups?.label ?? "";
    const href = stripOptionalMdTitle(m.groups?.href ?? "");
    if (m.index !== undefined) {
      out.push({
        type: "markdown",
        start: m.index,
        end: m.index + m[0].length,
        label,
        href,
      });
    }
  }

  for (const m of content.matchAll(WIKILINK)) {
    const title = (m.groups?.t ?? "").trim();
    const displayRaw = m.groups?.d?.trim();
    if (m.index !== undefined) {
      const w: ParsedWikilink = {
        type: "wikilink",
        start: m.index,
        end: m.index + m[0].length,
        title,
      };
      if (displayRaw !== undefined && displayRaw !== "") {
        w.display = displayRaw;
      }
      out.push(w);
    }
  }

  out.sort((a, b) => a.start - b.start);
  return out;
}

/** Remove fragmento #anchor do href para resolver ficheiro. */
export function hrefPathOnly(href: string): string {
  const hash = href.indexOf("#");
  return hash >= 0 ? href.slice(0, hash) : href;
}

/** Offset UTF-16 → linha e coluna 1-based. */
export function offsetToLineColumn(
  content: string,
  offset: number,
): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    const c = content[i];
    if (c === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, column: col };
}
