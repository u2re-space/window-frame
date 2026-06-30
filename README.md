# window-frame

Sub-shell for draggable / resizable window chrome with **`fest/object` reactivity** and a HTTPS Vite demo.

## Dev / HTTPS (:443)

- `npm install` (from repo root or this package directory)
- `npm run ssl:localhost` → writes `certs/cert.pem` + `certs/key.pem` (trusted self-signed PEMs bypass `@vitejs/plugin-basic-ssl`)
- `npm run dev` → listens on **`VIEW_DEV_PORT` or 443**, HTTPS enabled  
  Port **443** often needs elevated privileges (`sudo`), **`VIEW_DEV_HTTP=1`** (HTTP), or **`VIEW_DEV_PORT=8434`** (`npm run dev:8434`).
- **`VITE_DEV_ORIGIN`** mirrors `markdown-view` behavior for workers/mobile LAN access

Demo entry: **`index.html`** → `demo/boot.ts` mounts two frames:

- **Markdown viewer** (`buildViewerView` + `simpleMarkdown`) — `/demo/sample.md`, `/demo/longer.md`, `/demo/README.txt`
- **Explorer** (`buildExplorerView`) drives the shared reactive `selectedPath`.

## Tagged templates vs lure `H`

Bundled demo uses `./src/dom-lite.ts` (`h` + `Q`) so the SPA stays **small** (~tens of kB gzipped) instead of importing `fest/lure`’s `H` chain (pulls OPFS/UI via `Refs` → `fest/lure`). The public API aliases `h` as **`H`** from `src/index.ts` so call sites mirror lure ergonomics.

## Mobile layout (`max-width: 640px`)

Entering the breakpoint **maximizes** frames (`maximizedMobile` ref). Models with **`demoRole: "explorer"` | `"viewer"`** split the viewport (explorer strip + viewer body). Tap a maximized title bar restores floating cards inside the breakpoint; desktop retains drag + SE-corner resize.

## Tests

```bash
npm test
```

(`vitest` — `simpleMarkdown` unit checks.)
