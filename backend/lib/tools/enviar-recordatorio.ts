/**
 * Tool: envía el resumen fiscal + link del calendario por WhatsApp vía Zavu.
 *
 * Regla del proyecto: NUNCA simular un envío exitoso. Si falla, se reporta
 * el error y la UI ofrece la descarga del .ics.
 */
import type { EnvioResultado } from "../types/resultado";
import type { EnviarRecordatorioInput } from "../types/tools";
import { validarTelefonoBoliviano } from "../utils/validar-telefono";
import { enviarWhatsApp } from "../utils/zavu";

export async function enviarRecordatorio(input: EnviarRecordatorioInput): Promise<EnvioResultado> {
  const tel = validarTelefonoBoliviano(input.telefono);
  if (!tel.valido || !tel.e164) {
    return { exito: false, error: tel.error ?? "Número de teléfono inválido." };
  }

  const fecha = formatearFecha(input.proximoVencimiento);

  const lineas = [
    "*TributInfo* — tu resumen fiscal",
    "",
    `Régimen: *${input.regimen}*`,
    `Próximo vencimiento: *${fecha}*`,
    `Concepto: ${input.concepto}`,
  ];
  if (input.linkCalendario) {
    lineas.push("", `Descargá tu calendario fiscal completo: ${input.linkCalendario}`);
  }
  lineas.push("", "Te avisaremos antes de cada vencimiento.");

  const resultado = await enviarWhatsApp({
    to: tel.e164,
    text: lineas.join("\n"),
  });

  if (!resultado.ok) {
    return {
      exito: false,
      error: mensajeLegible(resultado.errorCode, resultado.errorMessage),
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

function mensajeLegible(code?: string, raw?: string): string {
  switch (code) {
    case "whatsapp_window_closed":
      return "WhatsApp no permite iniciar la conversación: el destinatario debe escribirnos primero, o hay que usar un template aprobado. Descargá el calendario mientras tanto.";
    case "url_not_verified":
      return "Zavu bloqueó el mensaje porque el link no está verificado. Hay que registrar la URL en Zavu (/v1/urls). Descargá el calendario mientras tanto.";
    case "missing_api_key":
      return "Falta configurar la API key de Zavu en el servidor.";
    default:
      return `No se pudo enviar el WhatsApp${raw ? `: ${raw}` : "."} Podés descargar el calendario directamente.`;
  }
}
