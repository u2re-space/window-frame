/**
 * Window-frame shell entrypoint (library surface for consumers + demo helpers).
 */

export {
    mountWindowFrame,
    createChromeModel,
    type DemoWindowRole,
    type WindowChromeModel,
    type MountWindowFrameOptions
} from "./frame/window-shell.ts";

export type { ChromeButtonHandlers, ChromeButtonsApi } from "./frame/buttons.ts";
export {
    mountChromeButtons,
    chromeIconMinimize,
    chromeIconMaximize,
    chromeIconRestore,
    chromeIconClose
} from "./frame/buttons.ts";

export { buildExplorerView, type ExplorerEntry } from "./views/explorer-view.ts";
export { buildViewerView } from "./views/viewer-view.ts";
export {
    instantiateViewExport,
    instantiateViewForMount,
    mountViewIntoHost,
    mountViewModule
} from "./views/view-mount.ts";

export { simpleMarkdown } from "./markdown-mini.ts";

export {
    MARKDOWN_VIEW_MANAGED_WINDOW_KEY,
    normalizeMarkdownViewWindowId,
    isMarkdownViewManagedWindowKey
} from "./views/markdown-view-window.ts";

/** WHY: Tagged-template + DOM query helpers styled like lure APIs for small bundles. */
export { h as H, Q } from "./dom-lite.ts";
