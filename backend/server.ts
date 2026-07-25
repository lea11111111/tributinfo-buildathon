/**
 * Servidor HTTP mínimo para el frontend Vite (client/).
 * Corre en http://localhost:3001 — ver client/src/lib/config.ts
 */
import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  cacheDiagnosisMeta,
  getLastDiagnosisMeta,
  runDiagnosis,
} from "./lib/adapters/diagnosis";
import { generarCalendario } from "./lib/tools/generar-calendario";
import { enviarRecordatorio } from "./lib/tools/enviar-recordatorio";
import type { DiagnosisInput, WhatsAppPayload } from "./lib/types/diagnosis-contract";
import type { NombreRegimen } from "./lib/types/resultado";

const PORT = Number(process.env.PORT ?? 3001);
const REGIMENES: NombreRegimen[] = ["General", "Simplificado", "STI", "RAU"];

const server = createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  try {
    if (req.method === "POST" && url.pathname === "/api/diagnose") {
      await handleDiagnose(req, res);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/whatsapp") {
      await handleWhatsApp(req, res);
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/descargar-calendario") {
      handleDescargarCalendario(url, res);
      return;
    }
    if (req.method === "GET" && url.pathname === "/health") {
      json(res, 200, { ok: true });
      return;
    }

    json(res, 404, { error: "Not found" });
  } catch (err) {
    json(res, 500, { error: err instanceof Error ? err.message : "Error interno" });
  }
});

async function handleDiagnose(req: IncomingMessage, res: ServerResponse) {
  const body = (await readJson(req)) as DiagnosisInput;
  if (!body.actividad || body.ventasMensuales == null || body.capital == null) {
    json(res, 400, { error: "Faltan campos obligatorios del diagnóstico." });
    return;
  }

  const { result, meta } = runDiagnosis(body);
  cacheDiagnosisMeta(meta);
  json(res, 200, result);
}

async function handleWhatsApp(req: IncomingMessage, res: ServerResponse) {
  const body = (await readJson(req)) as WhatsAppPayload;
  if (!body.telefono || !body.regimen) {
    json(res, 400, { exito: false, error: "Faltan telefono o regimen." });
    return;
  }

  const meta = getLastDiagnosisMeta();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${PORT}`;

  const resultado = await enviarRecordatorio({
    telefono: body.telefono,
    regimen: body.regimen,
    proximoVencimiento: meta?.proximoVencimiento ?? new Date().toISOString().slice(0, 10),
    concepto: meta?.concepto ?? "Obligaciones fiscales",
    linkCalendario: `${appUrl}/api/descargar-calendario?regimen=${encodeURIComponent(body.regimen)}&digito=0`,
  });

  json(res, resultado.exito ? 200 : 502, resultado);
}

function handleDescargarCalendario(url: URL, res: ServerResponse) {
  const regimen = url.searchParams.get("regimen") as NombreRegimen | null;
  const digito = Number(url.searchParams.get("digito"));
  const anioParam = url.searchParams.get("anio");

  if (!regimen || !REGIMENES.includes(regimen)) {
    json(res, 400, { error: `regimen inválido. Valores: ${REGIMENES.join(", ")}` });
    return;
  }
  if (!Number.isInteger(digito) || digito < 0 || digito > 9) {
    json(res, 400, { error: "digito inválido (0-9)" });
    return;
  }

  const cal = generarCalendario({
    regimen,
    ultimoDigitoNit: digito,
    anio: anioParam ? Number(anioParam) : undefined,
  });

  res.writeHead(200, {
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": `attachment; filename="${cal.nombreArchivo}"`,
    "Access-Control-Allow-Origin": "*",
  });
  res.end(cal.icsContent);
}

function setCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

server.listen(PORT, () => {
  console.log(`TributInfo API → http://localhost:${PORT}`);
});
