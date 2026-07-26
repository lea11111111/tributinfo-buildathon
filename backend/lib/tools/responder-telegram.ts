/**
 * Responde un mensaje inbound de Telegram con RAG + Ollama vía Zavu.
 * Zavu envía texto plano (sin parse_mode), así que limpiamos Markdown/citas.
 */
import { ragAsk } from "../ai/rag-ask";
import { limpiarRespuestaChat } from "../utils/limpiar-respuesta-chat";
import { enviarMensaje } from "../utils/zavu";

const TELEGRAM_MAX = 3900;

export async function responderTelegram(params: {
  chatId: string;
  texto: string;
}): Promise<void> {
  const pregunta = params.texto.trim();
  if (!pregunta) {
    await enviarMensaje({
      to: params.chatId,
      channel: "telegram",
      text: "Hola, soy TributInfo. Preguntame sobre regímenes, vencimientos o el NIT en Bolivia.",
    });
    return;
  }

  // Comandos cortos de saludo sin gastar el RAG
  if (/^(\/start|hola|hi|hello|buenas)\b/i.test(pregunta)) {
    await enviarMensaje({
      to: params.chatId,
      channel: "telegram",
      text:
        "Hola, soy TributInfo.\n\n" +
        "Preguntame sobre normativa tributaria boliviana (regímenes, vencimientos, NIT).\n" +
        "Ejemplo: ¿Cuánto paga el régimen simplificado?",
    });
    return;
  }

  let respuesta: string;
  try {
    const result = await ragAsk({ pregunta });
    respuesta = result.respuesta;
  } catch (err) {
    console.error("[telegram] RAG/Ollama falló:", err);
    respuesta =
      "No pude consultar la normativa ahora. Probá de nuevo en unos segundos o usá la web de TributInfo.";
  }

  const envio = await enviarMensaje({
    to: params.chatId,
    channel: "telegram",
    text: truncarTelegram(limpiarRespuestaChat(respuesta)),
  });
  if (!envio.ok) {
    console.error(
      `[telegram] No se pudo enviar a ${params.chatId}:`,
      envio.errorCode,
      envio.errorMessage,
    );
  }
}

function truncarTelegram(text: string): string {
  if (text.length <= TELEGRAM_MAX) return text;
  return `${text.slice(0, TELEGRAM_MAX - 20)}\n\n…(respuesta cortada)`;
}
