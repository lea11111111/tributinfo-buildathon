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
import { responderTelegram } from "./lib/tools/responder-telegram";
import type { DiagnosisInput, WhatsAppPayload } from "./lib/types/diagnosis-contract";
import { ragAsk } from "./lib/ai/rag-ask";
import { buscarNormativaConWeb } from "./lib/tools/buscar-normativa";
import type { NombreRegimen } from "./lib/types/resultado";
import {
  verifyZavuSignature,
  type ZavuInboundEvent,
} from "./lib/utils/zavu-webhook";

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
    // Alias: /api/telegram (preferido) y /api/whatsapp (compat)
    if (
      req.method === "POST" &&
      (url.pathname === "/api/telegram" || url.pathname === "/api/whatsapp")
    ) {
      await handleTelegramSend(req, res);
      return;
    }
    if (
      req.method === "POST" &&
      (url.pathname === "/api/zavu/webhook" || url.pathname === "/webhooks/zavu")
    ) {
      await handleZavuWebhook(req, res);
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/descargar-calendario") {
      handleDescargarCalendario(url, res);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/ask") {
      await handleAsk(req, res);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/buscar-normativa") {
      await handleBuscarNormativa(req, res);
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

async function handleTelegramSend(req: IncomingMessage, res: ServerResponse) {
  const body = (await readJson(req)) as WhatsAppPayload & { chatId?: string };
  const destino = body.chatId ?? body.telefono;
  if (!destino || !body.regimen) {
    json(res, 400, { exito: false, error: "Faltan chatId/telefono o regimen." });
    return;
  }

  // Preferimos lo que manda el frontend; la caché es solo respaldo (se pierde
  // cuando Render reinicia el servicio en el plan free).
  const meta = getLastDiagnosisMeta();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.RENDER_EXTERNAL_URL ??
    `http://localhost:${PORT}`;

  const resultado = await enviarRecordatorio({
    telefono: destino,
    regimen: body.regimen,
    proximoVencimiento:
      body.proximoVencimiento ??
      meta?.proximoVencimiento ??
      new Date().toISOString().slice(0, 10),
    concepto: body.concepto ?? meta?.concepto ?? "Obligaciones fiscales",
    linkCalendario:
      body.linkCalendario ??
      `${appUrl}/api/descargar-calendario?regimen=${encodeURIComponent(body.regimen)}&digito=0`,
  });

  json(res, resultado.exito ? 200 : 502, resultado);
}

/**
 * Webhook de Zavu: cuando alguien escribe al bot de Telegram,
 * respondemos con RAG + Ollama.
 *
 * Configurar en Zavu → Sender → Webhooks:
 *   URL: https://<tu-api>/api/zavu/webhook
 *   Events: message.inbound
 *   Secret → ZAVU_WEBHOOK_SECRET (opcional en local)
 */
async function handleZavuWebhook(req: IncomingMessage, res: ServerResponse) {
  const rawBody = await readRaw(req);
  const secret = process.env.ZAVU_WEBHOOK_SECRET;

  if (secret) {
    const signature = req.headers["x-zavu-signature"];
    const header = Array.isArray(signature) ? signature[0] : signature;
    if (!verifyZavuSignature(header, rawBody, secret)) {
      json(res, 401, { error: "Invalid signature" });
      return;
    }
  }

  let event: ZavuInboundEvent;
  try {
    event = rawBody ? (JSON.parse(rawBody) as ZavuInboundEvent) : {};
  } catch {
    json(res, 400, { error: "JSON inválido" });
    return;
  }

  // Ack inmediato (<30s) y procesar async (Ollama puede tardar).
  json(res, 200, { ok: true });

  if (event.type !== "message.inbound") return;

  const data = event.data;
  const chatId = data?.from;
  const texto = data?.text ?? "";
  const channel = (data?.channel ?? "").toLowerCase();

  if (!chatId) return;
  if (channel && channel !== "telegram") return;

  void responderTelegram({ chatId, texto }).catch((err) => {
    console.error("[zavu-webhook] Error respondiendo Telegram:", err);
  });
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


async function handleAsk(req: IncomingMessage, res: ServerResponse) {
  const body = (await readJson(req)) as { pregunta?: string; topK?: number };
  if (!body.pregunta?.trim()) {
    json(res, 400, { error: "Falta pregunta." });
    return;
  }
  try {
    const result = await ragAsk({ pregunta: body.pregunta.trim(), topK: body.topK });
    json(res, 200, result);
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Error en RAG/Ollama" });
  }
}

async function handleBuscarNormativa(req: IncomingMessage, res: ServerResponse) {
  const body = (await readJson(req)) as { consulta?: string; limite?: number };
  if (!body.consulta?.trim()) {
    json(res, 400, { error: "Falta consulta." });
    return;
  }
  json(res, 200, await buscarNormativaConWeb({ consulta: body.consulta.trim(), limite: body.limite }));
}
function readRaw(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const raw = await readRaw(req);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("JSON inválido");
  }
}

server.listen(PORT, () => {
  console.log(`TributInfo API → http://localhost:${PORT}`);
});
