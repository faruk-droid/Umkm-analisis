import { NextResponse } from "next/server";
import { getAIProviderConfig, GEMINI_MODEL } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getAIProviderConfig();
    return NextResponse.json({
      configured: Boolean(config),
      provider: config?.provider ?? null,
      model: config?.provider === "gemini" ? GEMINI_MODEL : null,
      note: "Status hanya memeriksa keberadaan konfigurasi server, bukan validitas key atau kuota provider.",
    });
  } catch (error) {
    console.error("AI provider configuration error:", error);
    return NextResponse.json({ error: "Konfigurasi provider AI tidak valid." }, { status: 500 });
  }
}
