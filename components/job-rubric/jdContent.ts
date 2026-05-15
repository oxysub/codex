import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

marked.setOptions({ breaks: true });

/** Normalize Windows/Airtable line endings before parse or save. */
export function normalizeJdLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/** Airtable long text often stores Markdown (**bold**, • bullets), not HTML. */
function looksLikeMarkdown(text: string): boolean {
  return (
    /\*\*[^*]+\*\*/.test(text) ||
    /^#{1,6}\s/m.test(text) ||
    /^\s*[-*+]\s+/m.test(text) ||
    /^\s*•\s*/m.test(text) ||
    /^\s*\d+\.\s+/m.test(text)
  );
}

/** Normalize Manatal/Airtable bullet lines for marked. */
function normalizeMarkdownBullets(text: string): string {
  return text.replace(/^(\s*)•(\s+)/gm, "$1- $2");
}

function stripOuterParagraph(html: string): string {
  const t = html.trim();
  if (/^<p>/i.test(t) && /<\/p>$/i.test(t)) {
    return t.replace(/^<p>/i, "").replace(/<\/p>$/i, "").trim();
  }
  return t;
}

/**
 * Quill + Tailwind preflight hide native list markers; literal • paragraphs match
 * the prior Airtable display and stay visible in the editor.
 */
function htmlListsToBulletParagraphs(html: string): string {
  const listToParagraphs = (inner: string, ordered: boolean) => {
    const items = inner.match(/<li[^>]*>[\s\S]*?<\/li>/gi) ?? [];
    let index = 0;
    return items
      .map((li) => {
        const body = stripOuterParagraph(li.replace(/<\/?li[^>]*>/gi, "").trim());
        const prefix = ordered ? `${++index}. ` : "• ";
        return `<p>${prefix}${body}</p>`;
      })
      .join("");
  };

  return html
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => listToParagraphs(inner, true))
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => listToParagraphs(inner, false));
}

function plainBlockToHtml(block: string): string {
  if (!block.trim()) {
    return "<p><br></p>";
  }
  const escaped = block
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  return `<p>${escaped}</p>`;
}

function markdownBlockToHtml(block: string): string {
  if (!block.trim()) {
    return "<p><br></p>";
  }
  try {
    const html = marked.parse(normalizeMarkdownBullets(block)) as string;
    const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    return htmlListsToBulletParagraphs(safe);
  } catch {
    return plainBlockToHtml(block);
  }
}

/** Split on paragraph breaks; keep empty segments as blank lines. */
function splitJdParagraphs(text: string): string[] {
  return normalizeJdLineEndings(text).split(/\n\n/);
}

/** Convert Airtable/plain JD into HTML for Quill when content is not already HTML. */
export function jdContentToHtml(raw: string): string {
  const t = normalizeJdLineEndings(raw).trim();
  if (!t) return "";
  if (/<[a-z][\s\S]*>/i.test(t)) return t;

  const blocks = splitJdParagraphs(t);
  if (!looksLikeMarkdown(t)) {
    return blocks.map((block) => plainBlockToHtml(block)).join("");
  }
  return blocks.map((block) => markdownBlockToHtml(block)).join("");
}

export function htmlToPlainText(html: string): string {
  if (!html.trim()) return "";
  if (typeof document === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.innerText || div.textContent || "").replace(/\u00a0/g, " ").trim();
}

function isEmptyParagraph(el: HTMLElement): boolean {
  const html = el.innerHTML.trim().toLowerCase();
  return html === "" || html === "<br>" || html === "<br/>";
}

function serializeInline(el: HTMLElement): string {
  let out = "";
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      out += (node.textContent ?? "").replace(/\u00a0/g, " ");
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const child = node as HTMLElement;
    const tag = child.tagName.toLowerCase();
    if (tag === "br") {
      out += "\n";
      continue;
    }
    if (child.classList.contains("ql-ui")) continue;
    const inner = serializeInline(child);
    if (tag === "strong" || tag === "b") {
      if (inner.trim()) out += `**${inner.trim()}**`;
    } else if (tag === "em" || tag === "i") {
      if (inner.trim()) out += `*${inner.trim()}*`;
    } else {
      out += inner;
    }
  }
  return out;
}

function serializeParagraph(el: HTMLElement): string {
  if (isEmptyParagraph(el)) return "\n";
  const content = serializeInline(el).trimEnd();
  if (!content.trim()) return "\n";
  if (content.startsWith("• ")) return `${content}\n`;
  if (/^\d+\.\s/.test(content)) return `${content}\n`;
  return `${content}\n\n`;
}

function serializeElement(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  if (tag === "br") return "\n";
  if (el.classList.contains("ql-ui")) return "";

  switch (tag) {
    case "p":
      return serializeParagraph(el);
    case "strong":
    case "b": {
      const t = serializeInline(el).trim();
      return t ? `**${t}**` : "";
    }
    case "em":
    case "i": {
      const t = serializeInline(el).trim();
      return t ? `*${t}*` : "";
    }
    case "li": {
      const t = serializeInline(el).trim();
      if (!t) return "";
      if (el.getAttribute("data-list") === "ordered") {
        return `${t}\n`;
      }
      if (t.startsWith("• ") || t.startsWith("- ")) return `${t}\n`;
      return `- ${t}\n`;
    }
    case "ul":
    case "ol":
      return Array.from(el.children)
        .map((child) => serializeElement(child as HTMLElement))
        .join("");
    case "h1":
      return `# ${serializeInline(el).trim()}\n\n`;
    case "h2":
      return `## ${serializeInline(el).trim()}\n\n`;
    case "h3":
      return `### ${serializeInline(el).trim()}\n\n`;
    default:
      return serializeInline(el);
  }
}

/** Quill HTML → Airtable rich-text Markdown (API format for the `jd` field). */
export function htmlToAirtableRichText(html: string): string {
  if (!html.trim()) return "";
  if (typeof document === "undefined") {
    return htmlToPlainText(html);
  }
  const root = document.createElement("div");
  root.innerHTML = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  const md = Array.from(root.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? "").replace(/\u00a0/g, " ");
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return serializeElement(node as HTMLElement);
      }
      return "";
    })
    .join("");
  return normalizeJdLineEndings(md).replace(/\n+$/, "");
}

/** Airtable rich-text fields expect a trailing newline when saved via API. */
export function formatForAirtableRichText(markdown: string): string {
  const t = markdown.trimEnd();
  return t ? `${t}\n` : "";
}
