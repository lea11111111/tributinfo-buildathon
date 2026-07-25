/**
 * Normaliza y valida números de celular bolivianos a formato E.164 (+591XXXXXXXX).
 * Celulares bolivianos: 8 dígitos, empiezan con 6 o 7.
 */
export interface TelefonoValidado {
  valido: boolean;
  e164?: string;
  error?: string;
}

export function validarTelefonoBoliviano(telefono: string): TelefonoValidado {
  const limpio = telefono.replace(/[\s\-().]/g, "");

  let digitos: string;
  if (limpio.startsWith("+591")) {
    digitos = limpio.slice(4);
  } else if (limpio.startsWith("591") && limpio.length === 11) {
    digitos = limpio.slice(3);
  } else if (limpio.startsWith("+")) {
    return { valido: false, error: "Solo se aceptan números bolivianos (+591)." };
  } else {
    digitos = limpio;
  }

  if (!/^\d{8}$/.test(digitos)) {
    return { valido: false, error: "El celular boliviano tiene 8 dígitos (ej: 70000000)." };
  }

  if (!/^[67]/.test(digitos)) {
    return { valido: false, error: "Los celulares bolivianos empiezan con 6 o 7." };
  }

  return { valido: true, e164: `+591${digitos}` };
}
