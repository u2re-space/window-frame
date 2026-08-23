/*
 * Filename: view-mount.ts
 * FullPath: modules/shells/environment-shell/src/window/views/view-mount.ts
 * Change date and time: 23.10.00_23.08.2026
 * Reason for changes: Yield one frame after import so Loading paints before view DOM.
 * FIND:hang-open
 */
/**
 * WHY: Embed `modules/views/*` packages inside the chrome body (`View` contract in `views/types`).
 * Depends on Vite aliases from modules/views/view-resolve-aliases.js.
 */
import type { View, ViewLifecycle, ViewModule, ViewOptions } from "views/types";

function isViewLike(x: unknown): x is View {
    return Boolean(x && typeof x === "object" && typeof (x as View).render === "function");
}

function runViewLifecycle(view: View | undefined, phase: keyof ViewLifecycle): void {
    const fn = view?.lifecycle?.[phase];
    if (typeof fn === "function") void Promise.resolve(fn());
}

/** `export default` is a `CustomElementConstructor` (e.g. markdown-view) — must use `new`. */
function isHTMLElementSubclassConstructor(value: unknown): value is new (opts?: ViewOptions) => HTMLElement {
    if (typeof value !== "function") return false;
    try {
        const proto = (value as { prototype?: unknown }).prototype;
        return Boolean(proto != null && typeof HTMLElement !== "undefined" && HTMLElement.prototype.isPrototypeOf(proto as object));
    } catch {
        return false;
    }
}

/**
 * Factory result plus optional {@link View} instance so callers can run {@link ViewLifecycle}
 * after the root node is connected (e.g. settings-view adopted stylesheets / shadow roots).
 */
export function instantiateViewForMount(
    mod: ViewModule | Record<string, unknown>,
    options?: ViewOptions
): { root: HTMLElement; view?: View } {
    const d = (mod as ViewModule).default ?? (mod as ViewModule).createView ?? (mod as ViewModule).createHomeView;
    if (!d || typeof d !== "function") {
        throw new Error("window-frame view-mount: module has no default/createView factory");
    }
    const instance = isHTMLElementSubclassConstructor(d)
        ? new d(options)
        : (d as (opts?: ViewOptions) => unknown)(options);

    /* WHY: Many views use CE factories but `render()` returns a *different* subtree (explorer, airpad, workcenter,
     * markdown viewer). Mounting the bare host yields an empty frame; lifecycle on the host still owns cleanup. */
    if (isViewLike(instance)) {
        const view = instance as View;
        const root = view.render(options);
        if (!(root instanceof HTMLElement)) {
            throw new Error("window-frame view-mount: view.render() must return HTMLElement");
        }
        return { root, view };
    }
    if (instance instanceof HTMLElement) {
        return { root: instance };
    }
    throw new Error("window-frame view-mount: factory did not return View or HTMLElement");
}

/**
 * Normalize a dynamically imported module factory (`export default createX`) into a root {@link HTMLElement}.
 */
export function instantiateViewExport(mod: ViewModule | Record<string, unknown>, options?: ViewOptions): HTMLElement {
    return instantiateViewForMount(mod, options).root;
}

export function mountViewIntoHost(host: HTMLElement, root: HTMLElement): () => void {
    host.replaceChildren(root);
    return () => {
        root.remove();
        host.replaceChildren();
    };
}

/** Lazy-load e.g. `import('views/home-view')`, attach into frame body. */
export async function mountViewModule(
    importer: () => Promise<ViewModule>,
    host: HTMLElement,
    options?: ViewOptions
): Promise<() => void> {
    const mod = await importer();
    /* PERF: let `Loading …` paint and the click handler finish before Settings/Explorer DOM. */
    if (typeof requestAnimationFrame === "function") {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    const { root, view } = instantiateViewForMount(mod as ViewModule, options);
    root.classList.add("wf-mounted-view");
    const disposeHost = mountViewIntoHost(host, root);
    runViewLifecycle(view, "onMount");
    runViewLifecycle(view, "onShow");
    return () => {
        runViewLifecycle(view, "onHide");
        runViewLifecycle(view, "onUnmount");
        disposeHost();
    };
}
