import { chatOllama } from "./ollama";
import { buscarNormativa, buscarNormativaConWeb } from "../tools/buscar-normativa";

export type RagAskInput = {
  pregunta: string;
  topK?: number;
};

export type RagAskResult = {
  pregunta: string;
  respuesta: string;
  fuentes: string[];
  fragmentos: ReturnType<typeof buscarNormativa>["fragmentos"];
};

export async function ragAsk(input: RagAskInput): Promise<RagAskResult> {
  const retrieval = await buscarNormativaConWeb({
    consulta: input.pregunta,
    limite: input.topK ?? 4,
  });

  const contextBlocks = retrieval.fragmentos.map((f) =>
    f.url
      ? `[Fuente: ${f.fuente} | ${f.url}]\n${f.texto}`
      : `[Fuente: ${f.fuente} | chunk ${f.chunkIndex}]\n${f.texto}`,
  );
  const context = contextBlocks.join("\n\n---\n\n");

  const system = `Eres un asistente experto en normativa tributaria del Servicio de Impuestos Nacionales (SIN) de Bolivia.
Responde SOLO con base en el contexto proporcionado.
Si el contexto no alcanza, dilo claramente y no inventes artículos, plazos, formularios ni resoluciones.
Cita la fuente usando el nombre del archivo entre corchetes.
No inventes montos ni fechas que no aparezcan en el contexto.
Responde en español, claro y conciso.`;

  const user = `CONTEXTO:\n${context || "(sin contexto recuperado)"}\n\nPREGUNTA:\n${input.pregunta}`;

  const respuesta = await chatOllama([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  return {
    pregunta: input.pregunta,
    respuesta,
    fuentes: [...new Set(retrieval.fragmentos.map((f) => f.fuente))],
    fragmentos: retrieval.fragmentos,
  };
}
