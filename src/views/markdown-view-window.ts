/**
 * Contract for opening `views/markdown-view` (CwViewViewer) inside `mountWindowFrame`.
 *
 * - **`viewer`** — primary id (registry, IPC, demo `readerWindow` map key).
 * - **`markdown`** (and related strings) — aliases; same module, same managed window row as `viewer`.
 *
 * Shells MUST collapse aliases via {@link normalizeMarkdownViewWindowId} before `Map` lookups / `focusWindow`.
 */

export const MARKDOWN_VIEW_MANAGED_WINDOW_KEY = "viewer" as const;

const ALIASES = new Set([
    "markdown",
    "markdown-view",
    "markdown-viewer",
    "reader",
    /** `ui-taskbar` / `makeTask("#env-viewer")` — hash becomes this id (see fest/lure tasking). */
    "env-viewer"
]);

/**
 * Strip legacy desktop typos, normalize markdown family → {@link MARKDOWN_VIEW_MANAGED_WINDOW_KEY};
 * leave all other ids unchanged (`explorer`, `settings`, …).
 */
export function normalizeMarkdownViewWindowId(raw: string): string {
    let id = String(raw ?? "").trim().toLowerCase();
    id = id.replace(/^#/, "");
    const todo = /^todo:\s*(.*)$/i.exec(id);
    if (todo) id = String(todo[1] ?? "").trim().toLowerCase();
    id = id.replace(/\s+/g, "");
    if (!id) return "";
    if (id === MARKDOWN_VIEW_MANAGED_WINDOW_KEY || ALIASES.has(id)) {
        return MARKDOWN_VIEW_MANAGED_WINDOW_KEY;
    }
    return id;
}

export function isMarkdownViewManagedWindowKey(id: string): boolean {
    return String(id || "").trim().toLowerCase() === MARKDOWN_VIEW_MANAGED_WINDOW_KEY;
}
