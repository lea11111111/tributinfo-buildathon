/**
 * GET /api/descargar-calendario?regimen=Simplificado&digito=4&anio=2026
 * Devuelve el .ics con Content-Disposition para descarga directa.
 *
 * Compatible con Next.js App Router (usa Request/Response estándar).
 */
import { generarCalendario } from "../../../lib/tools/generar-calendario";
import type { NombreRegimen } from "../../../lib/types/resultado";

const REGIMENES: NombreRegimen[] = ["General", "Simplificado", "STI", "RAU"];

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const regimen = url.searchParams.get("regimen") as NombreRegimen | null;
  const digito = Number(url.searchParams.get("digito"));
  const anioParam = url.searchParams.get("anio");

  if (!regimen || !REGIMENES.includes(regimen)) {
    return errorJson(`Parámetro 'regimen' inválido. Valores: ${REGIMENES.join(", ")}.`);
  }
  if (!Number.isInteger(digito) || digito < 0 || digito > 9) {
    return errorJson("Parámetro 'digito' inválido: debe ser un entero entre 0 y 9.");
  }

  try {
    const cal = generarCalendario({
      regimen,
      ultimoDigitoNit: digito,
      anio: anioParam ? Number(anioParam) : undefined,
    });

    return new Response(cal.icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${cal.nombreArchivo}"`,
      },
    });
  } catch (err) {
    return errorJson(err instanceof Error ? err.message : "Error generando el calendario.", 500);
  }
}

function errorJson(mensaje: string, status = 400): Response {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
