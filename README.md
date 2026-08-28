# window-frame

Подоболочка: перетаскиваемые / ресайзабельные рамки на `fest/object`. Не путать с полным [`environment-shell`](../environment-shell/).

В `modules/views/window-frame` — симлинк сюда.

## Демо

`index.html` → `demo/boot.ts`: две рамки — markdown viewer (`buildViewerView`) и explorer (`buildExplorerView`) на общем `selectedPath`.

На `max-width: 640px` рамки максимизируются (`maximizedMobile`). Роли `demoRole: "explorer" | "viewer"` делят экран; тап по заголовку возвращает карточки.

Публичный `H` — это лёгкий `h` из `src/dom-lite.ts`, не полный `fest/lure` `H` (чтобы бандл demo оставался маленьким).

## Запуск

```bash
cd modules/shells/window-frame
npm run ssl:localhost    # certs/*.pem — иначе plugin-basic-ssl
npm run dev              # VIEW_DEV_PORT или 443, HTTPS
npm run dev:8434
npm test                 # vitest, simpleMarkdown
```

`VIEW_DEV_HTTP=1` — HTTP. `VITE_DEV_ORIGIN` — как у markdown-view, для воркеров и LAN.
