import { chatGoogle } from "./google";
import { chatOllama, type OllamaMessage } from "./ollama";

export type AiProvider = "google" | "ollama";

export async function chatAI(
  messages: OllamaMessage[],
  options?: { model?: string; temperature?: number },
): Promise<string> {
  const provider = getAiProvider();

  if (provider === "google") {
    return chatGoogle(messages, options);
  }

  return chatOllama(messages, options);
}

export function getAiProvider(): AiProvider {
  const configured = process.env.AI_PROVIDER?.toLowerCase();
  if (configured === "google" || configured === "ollama") return configured;
  return process.env.GOOGLE_AI_API_KEY ? "google" : "ollama";
}
