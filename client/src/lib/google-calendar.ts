/**
 * Link "Añadir a Google Calendar" generado en el cliente.
 *
 * El backend ya manda `googleCalendarUrl` por evento, pero lo replicamos acá
 * como fallback: así el botón funciona igual con datos mock, y si el backend
 * queda dormido (plan free de Render) el usuario no se queda sin la acción.
 *
 * Espejo de `backend/lib/utils/google-calendar-link.ts`.
 */
import type { CalendarioEvento } from './types'

const BASE_URL = 'https://calendar.google.com/calendar/render'

/** "2026-08-15" → "20260815" (formato compacto que exige Google). */
function fechaCompacta(fechaIso: string): string {
  return fechaIso.replaceAll('-', '')
}

/** Día siguiente en ISO: los eventos de día completo terminan al día siguiente (exclusivo). */
function diaSiguienteIso(fechaIso: string): string {
  const [y, m, d] = fechaIso.split('-').map(Number)
  const fecha = new Date(Date.UTC(y, m - 1, d))
  fecha.setUTCDate(fecha.getUTCDate() + 1)
  return fecha.toISOString().slice(0, 10)
}

/** Construye el link de plantilla de evento de día completo. */
export function buildGoogleCalendarUrl(evento: CalendarioEvento): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evento.titulo,
    dates: `${fechaCompacta(evento.fecha)}/${fechaCompacta(diaSiguienteIso(evento.fecha))}`,
    details: evento.descripcion ?? evento.titulo,
  })

  return `${BASE_URL}?${params.toString()}`
}

/** Usa el link del backend si vino; si no, lo genera acá. */
export function googleCalendarUrlDe(evento: CalendarioEvento): string {
  return evento.googleCalendarUrl ?? buildGoogleCalendarUrl(evento)
}

/** Formatea "2026-08-17" como "17 de agosto". */
export function fechaLegible(fechaIso: string): string {
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  const [, m, d] = fechaIso.split('-').map(Number)
  if (!m || !d) return fechaIso
  return `${d} de ${meses[m - 1]}`
}
