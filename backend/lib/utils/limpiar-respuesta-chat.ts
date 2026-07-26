/**
 * Deja la respuesta del asistente legible en canales de texto plano
 * (Telegram vía Zavu no interpreta Markdown).
 */

/** ( [ETIQUETA…], Art. 13 ) → (Art. 13) */
const PARENTESIS_CON_ETIQUETA =
  /\(\s*\[(?:CORPUS LOCAL|DATOS VERIFICADOS|WEB OFICIAL SIN)[^\]]*\]\s*,?\s*([^)]*)\)/gi;

const ETIQUETA_FUENTE =
  /\[(?:CORPUS LOCAL|DATOS VERIFICADOS|WEB OFICIAL SIN)[^\]]*\]/gi;

/** Citas internas tipo [archivo.md | chunk 12] */
const CITA_CHUNK_O_MD = /\[[^\]]*(?:\.md\b|chunk\s+\d+)[^\]]*\]/gi;

export function limpiarRespuestaChat(text: string): string {
  let out = text;

  out = out.replace(PARENTESIS_CON_ETIQUETA, (_m, rest: string) => {
    const cleaned = rest.trim().replace(/^,\s*/, "");
    return cleaned ? `(${cleaned})` : "";
  });
  out = out.replace(ETIQUETA_FUENTE, "");
  out = out.replace(CITA_CHUNK_O_MD, "");

  // [texto](https://...) → texto (https://...)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)");

  // Negrita / cursiva Markdown
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/__([^_]+)__/g, "$1");
  out = out.replace(/(?<![\w*])\*([^*\n]+)\*(?![\w*])/g, "$1");
  out = out.replace(/(?<![\w_])_([^_\n]+)_(?![\w_])/g, "$1");

  // Encabezados Markdown
  out = out.replace(/^#{1,6}\s+/gm, "");

  // Espacios y saltos sobrantes tras borrar citas
  out = out.replace(/[ \t]+\n/g, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/[ \t]{2,}/g, " ");
  out = out.replace(/ +\./g, ".");
  out = out.replace(/ +,/g, ",");
  out = out.replace(/\(\s*\)/g, "");
  out = out.replace(/ \)/g, ")");
  out = out.trim();

  return out;
}
