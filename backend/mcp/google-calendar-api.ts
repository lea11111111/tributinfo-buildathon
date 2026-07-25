/**
 * Integración real con la API de Google Calendar (librería oficial `googleapis`).
 *
 * Usa OAuth2 con refresh token, el flujo recomendado para servidores MCP locales
 * de un solo usuario: las credenciales viven en variables de entorno y el
 * access token se renueva solo.
 *
 * Variables de entorno requeridas (ver mcp/README.md para obtenerlas):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * Opcional:
 *   GOOGLE_CALENDAR_ID (default: "primary", el calendario principal del usuario)
 */
import { google } from "googleapis";
import type { EventoFiscal } from "../lib/types/resultado";
import { diaSiguienteIso } from "../lib/utils/google-calendar-link";

export interface CredencialesGoogle {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

/** Lee las credenciales del entorno. Devuelve null si falta alguna (nunca inventa). */
export function leerCredencialesGoogle(): CredencialesGoogle | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

export interface EventoCreado {
  titulo: string;
  fecha: string;
  /** Link al evento ya creado en el calendario del usuario */
  htmlLink: string;
}

/**
 * Crea los eventos fiscales como eventos de día completo en Google Calendar,
 * con recordatorio (popup) 3 días antes — igual que el .ics.
 */
export async function crearEventosEnGoogleCalendar(
  eventos: EventoFiscal[],
  credenciales: CredencialesGoogle
): Promise<EventoCreado[]> {
  const oauth2 = new google.auth.OAuth2(credenciales.clientId, credenciales.clientSecret);
  oauth2.setCredentials({ refresh_token: credenciales.refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2 });
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  const creados: EventoCreado[] = [];
  for (const evento of eventos) {
    const res = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: evento.titulo,
        description: evento.descripcion,
        start: { date: evento.fecha },
        end: { date: diaSiguienteIso(evento.fecha) }, // fin exclusivo (día completo)
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 3 * 24 * 60 }], // 3 días antes
        },
      },
    });
    creados.push({
      titulo: evento.titulo,
      fecha: evento.fecha,
      htmlLink: res.data.htmlLink ?? "",
    });
  }
  return creados;
}
