/**
 * Envío de prueba real por WhatsApp vía Zavu.
 * Correr: npm run test:zavu
 *
 * Requiere en .env:
 *   ZAVU_API_KEY=...
 *   TEST_PHONE=+591XXXXXXXX  (un celular del equipo)
 *
 * IMPORTANTE: si el celular de destino nunca le escribió al número de Zavu,
 * WhatsApp puede rechazar el mensaje (ventana de 24h cerrada). En ese caso:
 * escribile "hola" al número de Zavu desde el celular de prueba y volvé a correr.
 */
import "dotenv/config";
import { enviarRecordatorio } from "../lib/tools/enviar-recordatorio";

const telefono = process.env.TEST_PHONE;

if (!process.env.ZAVU_API_KEY) {
  console.error("Falta ZAVU_API_KEY en .env — sacala del dashboard de Zavu.");
  process.exit(1);
}
if (!telefono) {
  console.error("Falta TEST_PHONE en .env — un celular del equipo, formato +591XXXXXXXX.");
  process.exit(1);
}

console.log(`Enviando WhatsApp de prueba a ${telefono}...`);

const resultado = await enviarRecordatorio({
  telefono,
  regimen: "Simplificado (PRUEBA)",
  proximoVencimiento: "2026-08-17",
  concepto: "Cuota bimestral RTS — mensaje de prueba del equipo",
});

console.log(JSON.stringify(resultado, null, 2));

if (resultado.exito) {
  console.log(`\nEnviado. Estado: ${resultado.estado}. Revisá el celular.`);
} else {
  console.error(`\nFalló el envío: ${resultado.error}`);
  console.error("Ver TODO-LEONARDO.md sección Zavu para los errores típicos (24h window, URL no verificada).");
  process.exit(1);
}
