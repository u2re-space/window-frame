/**
 * WHY: Two window frames — Markdown viewer + `views/home-view` embedded in the explorer slot (fallback list UIs if import fails).
 */
import type { ShellContext } from "views/types";
import { effect, numberRef, ref } from "@fest-lib/object";

import { createChromeModel, mountWindowFrame } from "../src/window/window-shell.js";
import { mountViewModule } from "../src/views/view-mount.ts";
import { buildExplorerView } from "../src/views/explorer-view.ts";
import { buildViewerView } from "../src/views/viewer-view.ts";

const selectedPath = ref("/demo/sample.md");
const viewerStatus = ref("(idle)");

const explorerItems = ref([
    { id: "1", label: "Overview", path: "/demo/sample.md", kind: "file" as const },
    { id: "2", label: "Longer note", path: "/demo/longer.md", kind: "file" as const },
    { id: "3", label: "Notes (stub)", path: "/demo/README.txt", kind: "folder" as const }
]);

const explorerSelection = ref(selectedPath.value);
const navEcho = ref("");

const shellContext: ShellContext = {
    navigate: (viewId) => {
        navEcho.value = `shell.navigate("${viewId}")`;
    },
    openView: (viewId) => {
        navEcho.value = `shell.openView("${viewId}")`;
    },
    showMessage: (msg) => {
        navEcho.value = `shell.showMessage(${JSON.stringify(msg).slice(0, 160)})`;
    }
};

const viewerModel = createChromeModel("Markdown viewer", {
    x: 120,
    y: 72,
    w: 480,
    h: 360,
    z: 40,
    demoRole: "viewer"
});
const explorerModel = createChromeModel("Home (views/)", {
    x: 540,
    y: 120,
    w: 320,
    h: 300,
    z: 41,
    demoRole: "explorer"
});

const topMost = numberRef(100);

function elevate(model: typeof viewerModel): void {
    topMost.value += 1;
    model.z.value = topMost.value;
}

const dock = document.getElementById("app") ?? document.body;
dock.style.position = "relative";
dock.classList.add("wf-demo-root");

const viewerBody = buildViewerView(selectedPath, viewerStatus);
mountWindowFrame(dock, viewerModel, viewerBody, () => elevate(viewerModel));

async function mountExplorerContent(): Promise<HTMLElement> {
    const explorerHost = document.createElement("div");
    explorerHost.className = "wf-frame-slot";

    try {
        await mountViewModule(() => import("views/home-view"), explorerHost, { shellContext });
    } catch (err) {
        console.warn("[window-frame demo] views/home-view unavailable, fallback explorer list", err);
        explorerHost.classList.remove("wf-frame-slot");
        const fallback = buildExplorerView(explorerItems, explorerSelection, (path) => {
            selectedPath.value = path;
        });
        explorerHost.replaceChildren(fallback);
    }

    return explorerHost;
}

const explorerBodyPromise = mountExplorerContent();
void explorerBodyPromise.then((explorerBody) => {
    mountWindowFrame(dock, explorerModel, explorerBody, () => elevate(explorerModel));
});

const hud = document.createElement("aside");
hud.className = "wf-hud wf-chrome-no-select";
hud.innerHTML =
    `<p><strong>${location.protocol}//${location.host}/</strong> — Drag empty title strip; resize SE corner on desktop; M3 window controls — split mobile layout unchanged.</p><p id="wf-hud-status"></p>`;
dock.appendChild(hud);

const statusLine = hud.querySelector("#wf-hud-status");
const mqLabel = ref(explorerModel.isMobileMq.matches ? "mobile" : "desktop");
explorerModel.isMobileMq.addEventListener("change", () => {
    mqLabel.value = explorerModel.isMobileMq.matches ? "mobile" : "desktop";
});

effect(
    () => {
        if (!statusLine) return;
        const nav = navEcho.value ? ` │ shell=${navEcho.value}` : "";
        statusLine.textContent =
            `doc=${selectedPath.value} │ viewer=${viewerStatus.value} │ mq=${mqLabel.value}${nav}`;
    },
    [selectedPath, viewerStatus, mqLabel, navEcho],
    { triggerImmediately: true }
);
