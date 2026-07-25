/**
 * Links "Añadir a Google Calendar" sin OAuth (camino seguro para la demo).
 *
 * Usa el formato oficial de URL de plantilla de eventos:
 *   https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...
 *
 * El usuario hace clic, Google Calendar se abre con el evento precargado y
 * solo confirma con "Guardar". No requiere credenciales ni red desde el backend.
 */

export interface DatosEventoLink {
  /** Fecha ISO del vencimiento, p. ej. "2026-08-15" */
  fecha: string;
  titulo: string;
  descripcion: string;
}

const BASE_URL = "https://calendar.google.com/calendar/render";

/** Convierte "2026-08-15" a "20260815" (formato compacto que exige Google). */
function fechaCompacta(fechaIso: string): string {
  return fechaIso.replaceAll("-", "");
}

/** Día siguiente en ISO (los eventos de día completo terminan al día siguiente, exclusivo). */
export function diaSiguienteIso(fechaIso: string): string {
  const [y, m, d] = fechaIso.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() + 1);
  return fecha.toISOString().slice(0, 10);
}

/**
 * Genera el link "Añadir a Google Calendar" para un evento de día completo.
 * Formato de `dates` para día completo: YYYYMMDD/YYYYMMDD (fin exclusivo).
 */
export function generarLinkGoogleCalendar(evento: DatosEventoLink): string {
  const inicio = fechaCompacta(evento.fecha);
  const fin = fechaCompacta(diaSiguienteIso(evento.fecha));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.titulo,
    dates: `${inicio}/${fin}`,
    details: evento.descripcion,
  });

  return `${BASE_URL}?${params.toString()}`;
}
