import type { refType } from "fest/object";
import { affected } from "fest/object";
import { h } from "../dom-lite.ts";

export type ExplorerEntry = { id: string; label: string; path: string; kind?: "file" | "folder" };

/**
 * Lightweight directory-style list driven by refs.
 */
export function buildExplorerView(
    itemsRef: refType<ExplorerEntry[]>,
    selectionRef: refType<string>,
    onSelect: (path: string) => void
): HTMLElement {
    const root = h`<div class="wf-explorer" part="explorer"></div>`;

    const rerenderList = () => {
        root.replaceChildren();
        for (const entry of itemsRef.value) {
            const row = h`<button type="button" class="wf-exp-row"></button>`;
            const icon = entry.kind === "folder" ? "📁" : "📄";
            row.appendChild(document.createTextNode(`${icon} ${entry.label}`));
            if (selectionRef.value === entry.path) row.classList.add("wf-exp-row_sel");

            row.addEventListener("click", () => {
                selectionRef.value = entry.path;
                onSelect(entry.path);
            });
            root.appendChild(row);
        }
    };

    const rerenderHighlightsOnly = () => {
        const rows = [...root.querySelectorAll<HTMLButtonElement>(".wf-exp-row")];
        const items = itemsRef.value;
        rows.forEach((row, idx) => {
            const entry = items[idx];
            row.classList.toggle("wf-exp-row_sel", entry != null && selectionRef.value === entry.path);
        });
    };

    affected(itemsRef, rerenderList);
    affected(selectionRef, rerenderHighlightsOnly);

    return root;
}
