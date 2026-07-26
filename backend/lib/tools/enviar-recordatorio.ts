/**
 * Tool: envía el resumen fiscal + link del calendario por Telegram (Zavu).
 *
 * Regla del proyecto: NUNCA simular un envío exitoso. Si falla, se reporta
 * el error y la UI ofrece la descarga del .ics.
 */
import type { EnvioResultado } from "../types/resultado";
import type { EnviarRecordatorioInput } from "../types/tools";
import { validarDestino } from "../utils/validar-destino";
import { enviarMensaje, getZavuChannel } from "../utils/zavu";

export async function enviarRecordatorio(input: EnviarRecordatorioInput): Promise<EnvioResultado> {
  const channel = getZavuChannel();
  const dest = validarDestino(input.telefono, channel);
  if (!dest.valido || !dest.to) {
    return { exito: false, error: dest.error ?? "Destinatario inválido." };
  }

  const fecha = formatearFecha(input.proximoVencimiento);

  const lineas = [
    "TributInfo - tu resumen fiscal",
    "",
    `Regimen: ${input.regimen}`,
    `Proximo vencimiento: ${fecha}`,
    `Concepto: ${input.concepto}`,
  ];
  if (input.linkCalendario) {
    lineas.push("", `Calendario fiscal: ${input.linkCalendario}`);
  }
  lineas.push("", "Te avisaremos antes de cada vencimiento.");

  const resultado = await enviarMensaje({
    to: dest.to,
    channel,
    text: lineas.join("\n"),
  });

  if (!resultado.ok) {
    return {
      exito: false,
      error: mensajeLegible(resultado.errorCode, resultado.errorMessage, channel),
    };
  }

  return {
    exito: true,
    estado: resultado.status,
    idMensaje: resultado.messageId,
  };
}

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  if (!y || !m || !d) return iso;
  return `${d} de ${meses[m - 1]} de ${y}`;
}

function mensajeLegible(code?: string, raw?: string, channel = "telegram"): string {
  const canal = channel === "telegram" ? "Telegram" : channel === "whatsapp" ? "WhatsApp" : "SMS";
  switch (code) {
    case "whatsapp_window_closed":
      return "WhatsApp no permite iniciar la conversación: el destinatario debe escribirnos primero, o hay que usar un template aprobado. Descargá el calendario mientras tanto.";
    case "url_not_verified":
      return "Zavu bloqueó el mensaje porque el link no está verificado. Hay que registrar la URL en Zavu (/v1/urls). Descargá el calendario mientras tanto.";
    case "missing_api_key":
      return "Falta configurar la API key de Zavu en el servidor.";
    default:
      return `No se pudo enviar por ${canal}${raw ? `: ${raw}` : "."} Podés descargar el calendario directamente.`;
  }
}
