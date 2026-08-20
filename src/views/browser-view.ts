/**
 * Inline browser pane — embeds arbitrary http(s) URLs in a floating `ui-window` via `<iframe>`.
 * WHY: Settings `Open links in → Inline` should open web links in-session, not only app views.
 *
 * Sites with `X-Frame-Options` / CSP `frame-ancestors` stay blank; chrome offers Open externally.
 */
import type { ViewOptions } from "views/types";

const STYLE = `
.wf-browser {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  inline-size: 100%;
  block-size: 100%;
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
  background: Canvas;
  color: CanvasText;
  font: 400 .875rem/1.35 system-ui, sans-serif;
}
.wf-browser__chrome {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: .4rem;
  padding: .35rem .5rem;
  border-block-end: 1px solid color-mix(in srgb, CanvasText 16%, transparent);
  background: color-mix(in srgb, Canvas 88%, CanvasText 12%);
}
.wf-browser__url {
  flex: 1 1 auto;
  min-inline-size: 0;
  border: 1px solid color-mix(in srgb, CanvasText 22%, transparent);
  border-radius: .4rem;
  padding: .3rem .55rem;
  background: Canvas;
  color: inherit;
}
.wf-browser__btn {
  flex: 0 0 auto;
  border: 1px solid color-mix(in srgb, CanvasText 22%, transparent);
  border-radius: .4rem;
  padding: .28rem .55rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.wf-browser__btn:hover { background: color-mix(in srgb, CanvasText 8%, transparent); }
.wf-browser__hint {
  flex: 0 0 auto;
  margin: 0;
  padding: .35rem .65rem;
  font-size: .75rem;
  opacity: .78;
  border-block-end: 1px solid color-mix(in srgb, CanvasText 12%, transparent);
}
.wf-browser__frame {
  flex: 1 1 auto;
  inline-size: 100%;
  block-size: 100%;
  min-block-size: 0;
  border: 0;
  background: #fff;
}
`;

function readInitialUrl(options?: ViewOptions): string {
    const p = (options?.params || {}) as Record<string, string>;
    const raw = String(p.url || p.href || p.src || "").trim();
    if (!raw) return "";
    try {
        if (/^https?:\/\//i.test(raw)) return new URL(raw).href;
        if (/^\/\//.test(raw)) return new URL(`https:${raw}`).href;
        if (/^www\./i.test(raw) || /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}([/:?#]|$)/i.test(raw)) {
            return new URL(`https://${raw.replace(/^\/+/, "")}`).href;
        }
    } catch {
        return "";
    }
    return "";
}

/** Factory used by {@link mountViewModule} (`default` export → HTMLElement). */
export function createBrowserView(options?: ViewOptions): HTMLElement {
    const root = document.createElement("div");
    root.className = "wf-browser";
    root.setAttribute("part", "browser");

    const style = document.createElement("style");
    style.textContent = STYLE;

    const chrome = document.createElement("div");
    chrome.className = "wf-browser__chrome";

    const input = document.createElement("input");
    input.className = "wf-browser__url";
    input.type = "url";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = "https://…";
    input.setAttribute("aria-label", "Page address");

    const go = document.createElement("button");
    go.type = "button";
    go.className = "wf-browser__btn";
    go.textContent = "Go";

    const external = document.createElement("button");
    external.type = "button";
    external.className = "wf-browser__btn";
    external.textContent = "Open ↗";
    external.title = "Open in a new browser tab";

    chrome.append(input, go, external);

    const hint = document.createElement("p");
    hint.className = "wf-browser__hint";
    hint.textContent =
        "Embedded page. If it stays blank, the site blocks iframes — use Open ↗.";

    const frame = document.createElement("iframe");
    frame.className = "wf-browser__frame";
    frame.title = "Embedded page";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.allow = "fullscreen; clipboard-read; clipboard-write; geolocation";
    /* WHY: no sandbox — many sites need scripts/storage; blank on XFO is handled via hint. */
    frame.setAttribute("loading", "lazy");

    const navigate = (raw: string): void => {
        const next = readInitialUrl({ params: { url: raw } });
        if (!next) return;
        input.value = next;
        frame.src = next;
        root.dataset.url = next;
        try {
            const host = new URL(next).hostname;
            root.dataset.title = host || "Browser";
        } catch {
            root.dataset.title = "Browser";
        }
    };

    go.addEventListener("click", () => navigate(input.value));
    input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            navigate(input.value);
        }
    });
    external.addEventListener("click", () => {
        const href = String(input.value || frame.src || "").trim();
        if (!href) return;
        try {
            window.open(href, "_blank", "noopener,noreferrer");
        } catch {
            /* ignore */
        }
    });

    root.append(style, chrome, hint, frame);

    const initial = readInitialUrl(options);
    if (initial) navigate(initial);

    return root;
}

export default createBrowserView;
