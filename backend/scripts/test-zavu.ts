/**
 * Envío de prueba real por Telegram vía Zavu.
 * Correr: pnpm run test:zavu
 *
 * Requiere en .env:
 *   ZAVU_API_KEY=...
 *   TEST_PHONE=<chatId>   (chat ID numérico de Telegram, no teléfono)
 *   ZAVU_CHANNEL=telegram
 *
 * IMPORTANTE: el usuario debe haberle escrito primero al bot (/start).
 * El chat ID aparece en el inbound de Zavu (campo `from`).
 */
import "dotenv/config";
import { enviarRecordatorio } from "../lib/tools/enviar-recordatorio";

const destino = process.env.TEST_PHONE;

if (!process.env.ZAVU_API_KEY) {
  console.error("Falta ZAVU_API_KEY en .env — sacala del dashboard de Zavu.");
  process.exit(1);
}
if (!destino) {
  console.error("Falta TEST_PHONE en .env — chat ID de Telegram del equipo.");
  process.exit(1);
}

console.log(`Enviando Telegram de prueba a chat ${destino}...`);

const resultado = await enviarRecordatorio({
  telefono: destino,
  regimen: "Simplificado (PRUEBA)",
  proximoVencimiento: "2026-08-17",
  concepto: "Cuota bimestral RTS — mensaje de prueba del equipo",
});

console.log(JSON.stringify(resultado, null, 2));

if (resultado.exito) {
  console.log(`\nEnviado. Estado: ${resultado.estado}. Revisá Telegram.`);
} else {
  console.error(`\nFalló el envío: ${resultado.error}`);
  console.error("Verificá que el bot esté conectado en Zavu y que el chat ID haya escrito /start.");
  process.exit(1);
}
