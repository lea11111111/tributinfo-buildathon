#!/usr/bin/env node
/**
 * Servidor MCP de TributInfo (transporte stdio).
 *
 * Expone las tools tributarias a cualquier cliente MCP (Cursor, Claude Desktop):
 *   - generar_calendario_fiscal: calendario de vencimientos + links "Añadir a Google Calendar"
 *   - agregar_a_google_calendar: crea los eventos directamente vía la API de Google (requiere OAuth)
 *
 * Cómo registrarlo y obtener credenciales: ver mcp/README.md
 *
 * OJO: con transporte stdio, stdout es el canal JSON-RPC. Todo log va a stderr
 * (console.error) y dotenv se carga en modo quiet para no ensuciar stdout.
 */
import { join } from "node:path";
import { config } from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generarCalendario } from "../lib/tools/generar-calendario";
import type { NombreRegimen } from "../lib/types/resultado";
import { crearEventosEnGoogleCalendar, leerCredencialesGoogle } from "./google-calendar-api";

// El cliente MCP puede spawnearnos desde cualquier cwd: el .env se resuelve
// relativo a este archivo (backend/.env). quiet evita logs en stdout.
config({ path: join(import.meta.dirname, "..", ".env"), quiet: true });

const REGIMENES = ["General", "Simplificado", "STI", "RAU"] as const;

const inputCalendario = {
  regimen: z
    .enum(REGIMENES)
    .describe("Régimen tributario boliviano del contribuyente"),
  ultimoDigitoNit: z
    .number()
    .int()
    .min(0)
    .max(9)
    .describe("Último dígito del NIT (0-9), define el día de vencimiento"),
  anio: z
    .number()
    .int()
    .optional()
    .describe("Año del calendario (default: año en curso)"),
};

const server = new McpServer({ name: "tributinfo", version: "0.1.0" });

server.registerTool(
  "generar_calendario_fiscal",
  {
    title: "Generar calendario fiscal",
    description:
      "Genera el calendario de vencimientos fiscales de Bolivia para un régimen tributario " +
      "y un último dígito de NIT. Devuelve los eventos (fecha, título, impuesto) con un link " +
      "'Añadir a Google Calendar' por evento. No requiere credenciales.",
    inputSchema: inputCalendario,
  },
  async ({ regimen, ultimoDigitoNit, anio }) => {
    const cal = generarCalendario({ regimen: regimen as NombreRegimen, ultimoDigitoNit, anio });
    const salida = {
      eventos: cal.eventos.map((e) => ({
        fecha: e.fecha,
        titulo: e.titulo,
        impuesto: e.impuesto,
        googleCalendarUrl: e.googleCalendarUrl,
      })),
      nombreArchivoIcs: cal.nombreArchivo,
      advertencias: cal.advertencias,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(salida, null, 2) }],
    };
  }
);

server.registerTool(
  "agregar_a_google_calendar",
  {
    title: "Agregar a Google Calendar",
    description:
      "Crea los vencimientos fiscales directamente en el Google Calendar del usuario vía la API " +
      "de Google (OAuth2). Requiere GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN " +
      "en el entorno. Si no están configuradas devuelve un error (no simula éxito).",
    inputSchema: inputCalendario,
  },
  async ({ regimen, ultimoDigitoNit, anio }) => {
    const credenciales = leerCredencialesGoogle();
    if (!credenciales) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              "No hay credenciales de Google configuradas (faltan GOOGLE_CLIENT_ID, " +
              "GOOGLE_CLIENT_SECRET y/o GOOGLE_REFRESH_TOKEN en backend/.env). " +
              "No se creó ningún evento. Cómo obtenerlas: ver backend/mcp/README.md. " +
              "Alternativa sin OAuth: usar la tool generar_calendario_fiscal, que devuelve " +
              "links 'Añadir a Google Calendar' por evento.",
          },
        ],
      };
    }

    const cal = generarCalendario({ regimen: regimen as NombreRegimen, ultimoDigitoNit, anio });

    try {
      const creados = await crearEventosEnGoogleCalendar(cal.eventos, credenciales);
      const salida = {
        mensaje: `Se crearon ${creados.length} eventos en Google Calendar.`,
        eventos: creados,
        advertencias: cal.advertencias,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(salida, null, 2) }],
      };
    } catch (err) {
      const detalle = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              `Error de la API de Google Calendar: ${detalle}. ` +
              "Verificar credenciales/permisos (scope calendar.events) en backend/mcp/README.md. " +
              "Alternativa sin OAuth: la tool generar_calendario_fiscal devuelve links " +
              "'Añadir a Google Calendar' por evento.",
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[tributinfo-mcp] servidor MCP listo en stdio");
}

main().catch((err) => {
  console.error("[tributinfo-mcp] error fatal:", err);
  process.exit(1);
});
