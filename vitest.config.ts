import viteConfig from "./vite.config.js";
import { mergeConfig } from "vitest/config";

export default mergeConfig(viteConfig, {
    test: {
        environment: "node",
        include: ["test/**/*.test.ts"]
    }
});
