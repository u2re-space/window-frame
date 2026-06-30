/**
 * Tiny markdown subset for static demo content (no external parser).
 * Controlled tag set — suitable only for demo/trusted snippets.
 */
function escapeHtml(s: string): string {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function inlineFormat(line: string): string {
    let t = escapeHtml(line);
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    return t;
}

function flushBullets(acc: string[], chunk: string[]) {
    if (chunk.length) acc.push("<ul>" + chunk.map((c) => "<li>" + c + "</li>").join("") + "</ul>");
    chunk.length = 0;
}

/**
 * WHY: Enough structure for viewer demos (headings, lists, fenced code blocks, emphasis).
 */
export function simpleMarkdown(src: string): string {
    const lines = src.replace(/\r\n/g, "\n").split("\n");
    const out: string[] = [];
    let inCode = false;
    let codeBuf: string[] = [];
    const bullets: string[] = [];

    const flushCode = () => {
        if (!inCode) return;
        out.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
        codeBuf = [];
        inCode = false;
    };

    for (const raw of lines) {
        if (raw.trimStart().startsWith("```")) {
            if (!inCode) {
                flushBullets(out, bullets);
                inCode = true;
                codeBuf = [];
            } else {
                flushCode();
            }
            continue;
        }
        if (inCode) {
            codeBuf.push(raw);
            continue;
        }

        const bulletMatch = /^[\t ]*([-+*]) (.+)$/.exec(raw);

        if (bulletMatch) {
            bullets.push(inlineFormat(bulletMatch[2]));
            continue;
        }

        flushBullets(out, bullets);

        if (raw.startsWith("# ")) {
            out.push("<h1>" + inlineFormat(raw.slice(2).trimEnd()) + "</h1>");
        } else if (raw.startsWith("## ")) {
            out.push("<h2>" + inlineFormat(raw.slice(3).trimEnd()) + "</h2>");
        } else if (raw.startsWith("### ")) {
            out.push("<h3>" + inlineFormat(raw.slice(4).trimEnd()) + "</h3>");
        } else if (raw.trim() === "---") {
            out.push("<hr>");
        } else if (raw.trim() === "") {
            out.push("<br>");
        } else {
            out.push("<p>" + inlineFormat(raw.trimEnd()) + "</p>");
        }
    }

    flushCode();
    flushBullets(out, bullets);

    return out.join("");
}
