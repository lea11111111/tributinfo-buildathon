/**
 * POST /api/whatsapp
 * Body: { telefono, regimen, proximoVencimiento, concepto, linkCalendario? }
 * Respuesta: EnvioResultado (ver lib/types/resultado.ts)
 *
 * Compatible con Next.js App Router (usa Request/Response estándar).
 */
import { enviarRecordatorio } from "../../../lib/tools/enviar-recordatorio";
import type { EnviarRecordatorioInput } from "../../../lib/types/tools";

export async function POST(request: Request): Promise<Response> {
  let body: Partial<EnviarRecordatorioInput>;
  try {
    body = await request.json();
  } catch {
    return json({ exito: false, error: "Body JSON inválido." }, 400);
  }

  const { telefono, regimen, proximoVencimiento, concepto } = body;
  if (!telefono || !regimen || !proximoVencimiento || !concepto) {
    return json(
      { exito: false, error: "Faltan campos: telefono, regimen, proximoVencimiento, concepto." },
      400
    );
  }

  const resultado = await enviarRecordatorio({
    telefono,
    regimen,
    proximoVencimiento,
    concepto,
    linkCalendario: body.linkCalendario,
  });

  return json(resultado, resultado.exito ? 200 : 502);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
