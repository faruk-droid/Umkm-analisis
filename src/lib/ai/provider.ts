export const GEMINI_MODEL = "gemini-3.5-flash-lite";

export type AIProvider = "gemini" | "openai";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
}

export function getAIProviderConfig(
  env: NodeJS.ProcessEnv = process.env
): AIProviderConfig | null {
  const preferredProvider = env.AI_PROVIDER?.trim().toLowerCase() || "gemini";

  if (preferredProvider === "openai" && env.OPENAI_API_KEY) {
    return { provider: "openai", apiKey: env.OPENAI_API_KEY };
  }
  if (preferredProvider === "gemini" && env.GEMINI_API_KEY) {
    return { provider: "gemini", apiKey: env.GEMINI_API_KEY };
  }

  if (preferredProvider !== "openai" && preferredProvider !== "gemini") {
    throw new Error("AI_PROVIDER harus bernilai 'gemini' atau 'openai'.");
  }

  if (env.GEMINI_API_KEY) {
    return { provider: "gemini", apiKey: env.GEMINI_API_KEY };
  }
  if (env.OPENAI_API_KEY) {
    return { provider: "openai", apiKey: env.OPENAI_API_KEY };
  }

  return null;
}
