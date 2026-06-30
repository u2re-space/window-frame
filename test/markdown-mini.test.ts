import { describe, expect, it } from "vitest";

import { simpleMarkdown } from "../src/markdown-mini.ts";

describe("simpleMarkdown demo helper", () => {
    it("renders headings and emphasis", () => {
        expect(simpleMarkdown("# H1")).toContain("<h1>H1");
        expect(simpleMarkdown("hello **Bold**")).toContain("<strong>Bold");
    });

    it("wraps fenced code", () => {
        const md = "```\nx\n```";
        expect(simpleMarkdown(md)).toContain("<pre><code>");
        expect(simpleMarkdown(md)).toContain("x");
    });

    it("buffers bullet groups", () => {
        expect(simpleMarkdown("- a\n- b")).toContain("<ul><li>");
        expect(simpleMarkdown("- a")).toContain("a");
    });
});
