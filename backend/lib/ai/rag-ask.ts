import { chatAI } from "./chat";
import { buscarNormativa, buscarNormativaConWeb } from "../tools/buscar-normativa";
import { limpiarRespuestaChat } from "../utils/limpiar-respuesta-chat";
import { contextoEstructurado } from "./contexto-estructurado";

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

/**
 * Arma el contexto en tres capas, de mayor a menor confiabilidad:
 * 1. DATOS VERIFICADOS — planillas oficiales (montos, cuotas, topes, fechas)
 * 2. CORPUS LOCAL — chunks del corpus del SIN
 * 3. WEB OFICIAL SIN — refuerzo Exa restringido a impuestos.gob.bo
 */
export async function ragAsk(input: RagAskInput): Promise<RagAskResult> {
  const bloques = contextoEstructurado(input.pregunta);
  const retrieval = await buscarNormativaConWeb({
    consulta: input.pregunta,
    limite: input.topK ?? 4,
  });

  const contextBlocks = [
    ...bloques.map((b) => `[DATOS VERIFICADOS | ${b.fuente}]\n${b.texto}`),
    ...retrieval.fragmentos.map((f) =>
      f.url
        ? `[WEB OFICIAL SIN | ${f.url}]\n${f.texto}`
        : `[CORPUS LOCAL | ${f.fuente} | chunk ${f.chunkIndex}]\n${f.texto}`,
    ),
  ];
  const context = contextBlocks.join("\n\n---\n\n");

  const system = `Eres un asistente experto en normativa tributaria del Servicio de Impuestos Nacionales (SIN) de Bolivia.
Responde SOLO con base en el contexto proporcionado.
El contexto tiene tres tipos de fuente, en orden de prioridad:
1. DATOS VERIFICADOS: planillas oficiales. Para montos, cuotas, alícuotas, topes y fechas, usa SIEMPRE estos datos.
2. CORPUS LOCAL: normativa oficial del SIN.
3. WEB OFICIAL SIN: páginas de impuestos.gob.bo.
Cuando cites, hacelo de forma natural (ej.: "según la Ley 843, Art. 13" o el nombre de la norma). Si hay URL oficial útil, escribila completa.
NUNCA copies etiquetas internas del contexto: no escribas [CORPUS LOCAL], [DATOS VERIFICADOS], [WEB OFICIAL SIN], nombres de archivo .md, ni "chunk".
No uses Markdown (nada de **, *, #, ni enlaces [texto](url)): el mensaje se lee en texto plano.
Si el contexto no alcanza, dilo claramente y no inventes artículos, plazos, formularios ni resoluciones.
No inventes montos ni fechas: cada número de tu respuesta debe aparecer en el contexto.
Responde en español, claro, natural y conciso.`;

  const user = `CONTEXTO:\n${context || "(sin contexto recuperado)"}\n\nPREGUNTA:\n${input.pregunta}`;

  const respuestaCruda = await chatAI([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
  const respuesta = limpiarRespuestaChat(respuestaCruda);

  return {
    pregunta: input.pregunta,
    respuesta,
    fuentes: [
      ...bloques.map((b) => b.fuente),
      ...new Set(retrieval.fragmentos.map((f) => f.fuente)),
    ],
    fragmentos: retrieval.fragmentos,
  };
}
