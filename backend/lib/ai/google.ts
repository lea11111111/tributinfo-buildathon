import type { OllamaMessage } from "./ollama";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function chatGoogle(
  messages: OllamaMessage[],
  options?: { model?: string; temperature?: number },
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY no está configurada.");
  }

  const model = options?.model ?? process.env.GOOGLE_AI_MODEL ?? "gemini-3.1-flash-lite";
  const endpoint = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  );
  endpoint.searchParams.set("key", apiKey);

  const systemInstruction = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");

  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
        : {}),
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
      },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (!res.ok) {
    throw new Error(
      `Google AI error ${res.status}: ${data.error?.message ?? "respuesta inválida"}`,
    );
  }

  const content = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!content) throw new Error("Google AI devolvió una respuesta vacía.");
  return content;
}
