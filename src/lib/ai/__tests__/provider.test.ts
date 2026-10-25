import { describe, expect, it } from "vitest";
import { getAIProviderConfig, GEMINI_MODEL } from "../provider";

describe("AI provider configuration", () => {
  it("uses Gemini by default when its server key is configured", () => {
    expect(getAIProviderConfig({ GEMINI_API_KEY: "server-key" })).toEqual({
      provider: "gemini",
      apiKey: "server-key",
    });
    expect(GEMINI_MODEL).toBe("gemini-3.5-flash-lite");
  });

  it("uses another configured provider if the preferred provider has no key", () => {
    expect(
      getAIProviderConfig({
        AI_PROVIDER: "gemini",
        OPENAI_API_KEY: "server-key",
      })
    ).toEqual({ provider: "openai", apiKey: "server-key" });
  });

  it("returns null when no provider key is configured", () => {
    expect(getAIProviderConfig({})).toBeNull();
  });

  it("rejects unknown provider names", () => {
    expect(() => getAIProviderConfig({ AI_PROVIDER: "mock" })).toThrow(
      "AI_PROVIDER harus bernilai 'gemini' atau 'openai'."
    );
  });
});
