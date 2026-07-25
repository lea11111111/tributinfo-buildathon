/**
 * Prueba las tools determinísticas sin agente ni servidor.
 * Correr: npm run test:tools
 *
 * Los casos vienen de los ejemplos del pitch. Las salidas esperadas hay que
 * verificarlas contra las planillas de Fernanda cuando estén cargadas.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { clasificarRegimen } from "../lib/tools/clasificar-regimen";
import { calcularImpuestos } from "../lib/tools/calcular-impuestos";
import { generarCalendario } from "../lib/tools/generar-calendario";
import { validarTelefonoBoliviano } from "../lib/utils/validar-telefono";
import { generarLinkGoogleCalendar } from "../lib/utils/google-calendar-link";
import { DATOS_VERIFICADOS } from "../lib/data/verificacion";

let fallos = 0;

function check(nombre: string, condicion: boolean, detalle?: string) {
  if (condicion) {
    console.log(`  OK   ${nombre}`);
  } else {
    fallos++;
    console.error(`  FAIL ${nombre}${detalle ? ` — ${detalle}` : ""}`);
  }
}

console.log("\n=== clasificar_regimen ===\n");

// Caso 1: doña Carmen — tienda de barrio chica
const carmen = clasificarRegimen({
  actividad: "comercio_minorista",
  capital: 5000,
  ventasAnuales: 48000, // ~Bs 4.000/mes
  tipoClientes: "consumidor_final",
});
console.log(`Doña Carmen -> ${carmen.nombre} (cat. ${carmen.categoria})`);
check("tienda de barrio chica -> Simplificado", carmen.nombre === "Simplificado");
check("tiene justificación", carmen.justificacion.length > 20);
check("tiene fuente", !!carmen.fuente.norma);

// Caso 2: freelancer con clientes del exterior
const freelancer = clasificarRegimen({
  actividad: "profesional_independiente",
  capital: 15000,
  ventasAnuales: 180000,
  tipoClientes: "exterior",
});
console.log(`Freelancer -> ${freelancer.nombre}`);
check("freelancer -> General", freelancer.nombre === "General");

// Caso 3: productor agrícola
const productor = clasificarRegimen({
  actividad: "agropecuaria",
  capital: 30000,
  ventasAnuales: 60000,
  tipoClientes: "mixto",
});
console.log(`Productor de papa -> ${productor.nombre}`);
check("agropecuaria -> RAU", productor.nombre === "RAU");

// Caso 4: transportista
const transportista = clasificarRegimen({
  actividad: "transporte",
  capital: 80000,
  ventasAnuales: 120000,
  tipoClientes: "consumidor_final",
});
check("transporte -> STI", transportista.nombre === "STI");

// Caso 5: borde — capital exactamente en el tope de una categoría
const borde = clasificarRegimen({
  actividad: "comercio_minorista",
  capital: 10000, // tope placeholder de la categoría 1
  ventasAnuales: 40000,
  tipoClientes: "consumidor_final",
});
check(
  "caso borde en tope de categoría genera advertencia",
  borde.advertencias.some((a) => a.includes("borde")),
  JSON.stringify(borde.advertencias)
);

// Caso 6: supera topes del RTS -> General con explicación
const superaTope = clasificarRegimen({
  actividad: "comercio_minorista",
  capital: 999999,
  ventasAnuales: 999999,
  tipoClientes: "consumidor_final",
});
check("comercio grande -> General", superaTope.nombre === "General");
check("explica por qué no entra al RTS", superaTope.justificacion.includes("supera"));

console.log("\n=== calcular_impuestos ===\n");

const cuotaRTS = calcularImpuestos({ regimen: "Simplificado", ventasMensuales: 4000, categoria: 1 });
console.log(`Simplificado cat.1 -> Bs ${cuotaRTS.lineas[0].monto} ${cuotaRTS.lineas[0].periodicidad}`);
check("Simplificado devuelve 1 línea (cuota fija)", cuotaRTS.lineas.length === 1);
check("cuota > 0", cuotaRTS.lineas[0].monto > 0);

const general = calcularImpuestos({ regimen: "General", ventasMensuales: 10000 });
console.log(
  `General Bs 10.000/mes -> ${general.lineas.map((l) => `${l.sigla}: Bs ${l.monto} (${l.periodicidad})`).join(", ")}`
);
check("General devuelve IVA, IT e IUE", general.lineas.length === 3);
check("total mensual estimado > 0", general.totalMensualEstimado > 0);

const sti = calcularImpuestos({ regimen: "STI", ventasMensuales: 5000 });
check(
  "STI sin datos: no inventa, devuelve advertencia",
  sti.totalMensualEstimado === 0 && sti.advertencias.some((a) => a.includes("STI"))
);

try {
  calcularImpuestos({ regimen: "Simplificado", ventasMensuales: 4000 }); // sin categoría
  check("Simplificado sin categoría lanza error", false);
} catch {
  check("Simplificado sin categoría lanza error", true);
}

console.log("\n=== generar_calendario ===\n");

const cal = generarCalendario({ regimen: "Simplificado", ultimoDigitoNit: 4, anio: 2026 });
console.log(`Simplificado, NIT ...4, 2026 -> ${cal.eventos.length} eventos, archivo: ${cal.nombreArchivo}`);
check("genera eventos", cal.eventos.length > 0);
check("nombre de archivo correcto", cal.nombreArchivo === "calendario-fiscal-2026.ics");
check("el .ics tiene VCALENDAR", cal.icsContent.includes("BEGIN:VCALENDAR"));
check("el .ics tiene alarmas", cal.icsContent.includes("BEGIN:VALARM"));

const calGeneral = generarCalendario({ regimen: "General", ultimoDigitoNit: 0, anio: 2026 });
check("General tiene 12 vencimientos (mensual)", calGeneral.eventos.length === 12);

try {
  generarCalendario({ regimen: "General", ultimoDigitoNit: 15 });
  check("dígito inválido lanza error", false);
} catch {
  check("dígito inválido lanza error", true);
}

console.log("\n=== links Google Calendar ===\n");

// Todos los eventos traen su link "Añadir a Google Calendar" con el formato oficial
check(
  "todos los eventos tienen googleCalendarUrl",
  cal.eventos.every((e) =>
    e.googleCalendarUrl?.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE")
  )
);

// Las fechas del link coinciden con la fecha del evento (día completo, fin exclusivo)
const primerEvento = cal.eventos[0];
const paramsLink = new URL(primerEvento.googleCalendarUrl!).searchParams;
const fechaCompacta = primerEvento.fecha.replaceAll("-", "");
check(
  "el parámetro dates arranca en la fecha del evento",
  paramsLink.get("dates")?.startsWith(`${fechaCompacta}/`) === true,
  `dates=${paramsLink.get("dates")}`
);
check("el parámetro text es el título del evento", paramsLink.get("text") === primerEvento.titulo);
check(
  "el parámetro details es la descripción",
  paramsLink.get("details") === primerEvento.descripcion
);

// Caso borde: fin de año — el día siguiente cruza al año nuevo
const linkFinDeAnio = generarLinkGoogleCalendar({
  fecha: "2026-12-31",
  titulo: "Prueba fin de año",
  descripcion: "cruce de año",
});
check(
  "evento del 31/12 termina el 01/01 del año siguiente",
  new URL(linkFinDeAnio).searchParams.get("dates") === "20261231/20270101",
  new URL(linkFinDeAnio).searchParams.get("dates") ?? "sin dates"
);

// Guardar el .ics para probarlo a mano en Google Calendar
const outDir = join(import.meta.dirname, "out");
mkdirSync(outDir, { recursive: true });
const icsPath = join(outDir, cal.nombreArchivo);
writeFileSync(icsPath, cal.icsContent, "utf8");
console.log(`\n.ics de prueba guardado en: ${icsPath}`);
console.log(">>> Importalo en Google Calendar para verificar que abre bien (tarea manual).");

console.log("\n=== validar_telefono ===\n");

check("70000000 -> +59170000000", validarTelefonoBoliviano("70000000").e164 === "+59170000000");
check("+591 7000-0000 -> +59170000000", validarTelefonoBoliviano("+591 7000-0000").e164 === "+59170000000");
check("59160000000 -> +59160000000", validarTelefonoBoliviano("59160000000").e164 === "+59160000000");
check("número corto rechazado", !validarTelefonoBoliviano("7000").valido);
check("fijo (empieza con 4) rechazado", !validarTelefonoBoliviano("44000000").valido);
check("extranjero rechazado", !validarTelefonoBoliviano("+5491155551234").valido);

console.log("\n===============================\n");
if (!DATOS_VERIFICADOS) {
  console.warn(
    "ADVERTENCIA: lib/data/ tiene montos PLACEHOLDER sin verificar.\n" +
      "Reemplazar con las planillas de Fernanda y poner DATOS_VERIFICADOS = true antes de la demo.\n"
  );
}

if (fallos > 0) {
  console.error(`${fallos} caso(s) fallaron.`);
  process.exit(1);
}
console.log("Todos los casos pasaron.");
