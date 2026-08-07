import type { refType } from "@fest-lib/object";
import { affected } from "@fest-lib/object";
import { h } from "../dom-lite.ts";
import { simpleMarkdown } from "../markdown-mini.ts";

/** Markdown panel: loads text by URL/path and renders via {@link simpleMarkdown}. */
export function buildViewerView(
    sourceRef: refType<string>,
    statusRef: refType<string>
): HTMLElement {
    const root = h`<div class="wf-viewer wf-md" part="viewer"><article class="wf-md-body"></article></div>`;
    const body = root.querySelector("article");

    async function reload() {
        const url = sourceRef.value?.trim?.() ?? "";
        if (!body || !url) return;
        statusRef.value = "loading…";
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error(String(res.status));
            const text = await res.text();
            body.innerHTML = simpleMarkdown(text);
            statusRef.value = "loaded";
        } catch (err) {
            body.innerHTML = `<p class="wf-md-err">${String(err)}</p>`;
            statusRef.value = "error";
        }
    }

    affected(sourceRef, () => {
        void reload();
    });

    void reload();
    return root;
}
