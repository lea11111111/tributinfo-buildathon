/**
 * Cliente mínimo de Zavu (API REST directa, sin SDK).
 * Docs: https://docs.zavu.dev/api-reference/send-a-message
 *
 * Notas importantes (ver TODO-LEONARDO.md):
 * - WhatsApp libre solo dentro de la ventana de 24h (el usuario escribió primero).
 *   Para iniciar conversación en frío hace falta un template preaprobado.
 * - Links en mensajes pueden requerir verificación previa (error url_not_verified).
 * - Cuentas sin KYC: máx. 200 mensajes/día por canal.
 */

const ZAVU_API_URL = "https://api.zavu.dev/v1/messages";

export interface ZavuSendParams {
  /** E.164, p. ej. +59170000000 */
  to: string;
  text: string;
  /** Si hay template aprobado para iniciar conversación en frío */
  templateId?: string;
  templateVariables?: Record<string, string>;
}

export interface ZavuResult {
  ok: boolean;
  status?: string; // queued | sent | delivered | failed...
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export async function enviarWhatsApp(params: ZavuSendParams): Promise<ZavuResult> {
  const apiKey = process.env.ZAVU_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      errorCode: "missing_api_key",
      errorMessage: "ZAVU_API_KEY no está configurada en las variables de entorno.",
    };
  }

  const body: Record<string, unknown> = params.templateId
    ? {
        to: params.to,
        channel: "whatsapp",
        messageType: "template",
        content: {
          templateId: params.templateId,
          templateVariables: params.templateVariables ?? {},
        },
      }
    : {
        to: params.to,
        channel: "whatsapp",
        text: params.text,
      };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (process.env.ZAVU_SENDER_ID) {
    headers["Zavu-Sender"] = process.env.ZAVU_SENDER_ID;
  }

  try {
    const res = await fetch(ZAVU_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, any>;

    if (!res.ok) {
      return {
        ok: false,
        errorCode: data.code ?? `http_${res.status}`,
        errorMessage: data.message ?? `Zavu respondió ${res.status}`,
      };
    }

    return {
      ok: true,
      status: data.message?.status,
      messageId: data.message?.id,
    };
  } catch (err) {
    return {
      ok: false,
      errorCode: "network_error",
      errorMessage: err instanceof Error ? err.message : "Error de red al llamar a Zavu.",
    };
  }
}
