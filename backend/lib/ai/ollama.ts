export type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatOllama(
  messages: OllamaMessage[],
  options?: { model?: string; temperature?: number },
): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = options?.model ?? process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: { temperature: options?.temperature ?? 0.2 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Ollama error ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content?.trim();
  if (!content) throw new Error("Ollama devolvió respuesta vacía");
  return content;
}
