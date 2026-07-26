/**
 * Cliente mínimo de Zavu (API REST directa, sin SDK).
 * Docs: https://docs.zavu.dev/api-reference/send-a-message
 *
 * Canales: telegram | sms | whatsapp (via ZAVU_CHANNEL).
 * Telegram usa chat ID numérico, no teléfono.
 */

const ZAVU_API_URL = "https://api.zavu.dev/v1/messages";

export type ZavuChannel = "telegram" | "sms" | "whatsapp";

export function getZavuChannel(): ZavuChannel {
  const raw = (process.env.ZAVU_CHANNEL ?? "telegram").toLowerCase();
  if (raw === "sms" || raw === "whatsapp" || raw === "telegram") return raw;
  return "telegram";
}

export interface ZavuSendParams {
  /** E.164 (+591…) o chat ID de Telegram */
  to: string;
  text: string;
  /** Override del canal; por defecto ZAVU_CHANNEL */
  channel?: ZavuChannel;
  /** Si hay template aprobado para iniciar conversación en frío (WhatsApp) */
  templateId?: string;
  templateVariables?: Record<string, string>;
}

export interface ZavuResult {
  ok: boolean;
  status?: string;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export async function enviarMensaje(params: ZavuSendParams): Promise<ZavuResult> {
  const apiKey = process.env.ZAVU_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      errorCode: "missing_api_key",
      errorMessage: "ZAVU_API_KEY no está configurada en las variables de entorno.",
    };
  }

  const channel = params.channel ?? getZavuChannel();

  const body: Record<string, unknown> = params.templateId
    ? {
        to: params.to,
        channel: params.channel ?? "whatsapp",
        messageType: "template",
        content: {
          templateId: params.templateId,
          templateVariables: params.templateVariables ?? {},
        },
      }
    : {
        to: params.to,
        channel,
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

/** @deprecated usar enviarMensaje */
export const enviarWhatsApp = enviarMensaje;
