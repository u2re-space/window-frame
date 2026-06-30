/**
 * HTTPS SPA demo for window-frame (@see npm run ssl:localhost for certs/).
 * Aliases from modules/views `view-resolve-aliases` (+ local tsconfig paths).
 */
import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import {
    getViewResolveAliases,
    workspaceRoot,
    viewsRoot
} from "../../views/view-resolve-aliases.js";
import { tryLoadDevSslFromDir } from "../../shared/vite.view.config.js";

const pkgRoot = resolve(import.meta.dirname);
const projectsRoot = resolve(workspaceRoot, "modules/projects");

function resolveDevServerPort() {
    const raw = process.env.VIEW_DEV_PORT;
    if (raw != null && String(raw).trim() !== "") {
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : 443;
    }
    return 443;
}

const port = resolveDevServerPort();
const useHttps = process.env.VIEW_DEV_HTTP !== "1";
const projectSsl = tryLoadDevSslFromDir(pkgRoot, { sslDir: "certs" });
const plugins = useHttps ? (projectSsl !== null ? [] : [basicSsl()]) : [];
const serverHttps = !useHttps ? false : projectSsl !== null ? projectSsl : undefined;
const viteDevOrigin = (process.env.VITE_DEV_ORIGIN || "").trim();

export default defineConfig({
    root: pkgRoot,
    /** Relative /assets/* so static deploy + reverse proxies need not mirror absolute /assets. */
    base: "./",
    plugins,
    resolve: {
        alias: getViewResolveAliases(pkgRoot)
    },
    server: {
        host: "0.0.0.0",
        open: false,
        strictPort: false,
        port,
        ...(viteDevOrigin ? { origin: viteDevOrigin } : {}),
        https: serverHttps,
        fs: {
            allow: [
                searchForWorkspaceRoot(pkgRoot),
                workspaceRoot,
                viewsRoot,
                resolve(workspaceRoot, "modules/views"),
                resolve(workspaceRoot, "modules/shells"),
                projectsRoot
            ]
        }
    },
    build: {
        target: "esnext",
        outDir: "dist",
        emptyOutDir: true,
        cssMinify: false,
        rollupOptions: {
            input: {
                main: resolve(pkgRoot, "index.html"),
                demo: resolve(pkgRoot, "demo.html")
            }
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true
            }
        }
    }
});
