/**
 * Valida el destinatario según el canal de Zavu.
 * - telegram: chat ID numérico
 * - sms / whatsapp: celular boliviano E.164
 */
import { getZavuChannel, type ZavuChannel } from "./zavu";
import { validarTelefonoBoliviano } from "./validar-telefono";

export interface DestinoValidado {
  valido: boolean;
  to?: string;
  error?: string;
}

export function validarDestino(
  valor: string,
  channel: ZavuChannel = getZavuChannel(),
): DestinoValidado {
  if (channel === "telegram") {
    return validarChatIdTelegram(valor);
  }
  const tel = validarTelefonoBoliviano(valor);
  if (!tel.valido || !tel.e164) {
    return { valido: false, error: tel.error ?? "Número de teléfono inválido." };
  }
  return { valido: true, to: tel.e164 };
}

export function validarChatIdTelegram(valor: string): DestinoValidado {
  const limpio = valor.trim().replace(/\s/g, "");
  // Chat IDs de usuario son enteros (pueden ser negativos en grupos: -100…)
  if (!/^-?\d{5,20}$/.test(limpio)) {
    return {
      valido: false,
      error: "Usá tu chat ID de Telegram (número, ej: 123456789). Escribile primero al bot.",
    };
  }
  return { valido: true, to: limpio };
}
