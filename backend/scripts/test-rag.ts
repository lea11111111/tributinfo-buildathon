/**
 * Benchmark del RAG híbrido — corre OFFLINE (sin Ollama ni Exa).
 *
 * Por cada caso evalúa:
 *  - fuente correcta en el top-K local o en los datos estructurados
 *  - términos/números esperados presentes en el contexto combinado
 *  - que las consultas de vigencia disparen el refuerzo web
 *
 * Uso: pnpm --filter tributinfo-backend test:rag
 * Sale con código 1 si falla algún caso crítico (montos verificados).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contextoEstructurado } from "../lib/ai/contexto-estructurado";
import {
  buscarNormativa,
  necesitaRefuerzoWeb,
} from "../lib/tools/buscar-normativa";

type Caso = {
  /** Id de semilla (backend/eval/semillas.jsonl) para mapear variantes de Adaption */
  id?: string;
  pregunta: string;
  /** Regex que debe matchear alguna fuente del top-K o de los bloques estructurados */
  fuenteEsperada?: RegExp;
  /** Términos o números que deben aparecer en el contexto combinado */
  terminosEsperados?: string[];
  /** La consulta debería disparar el refuerzo web (vigencia/actualidad) */
  esperaWeb?: boolean;
  /** Crítico: si falla, el script sale con código 1 */
  critico?: boolean;
};

const CASOS: Caso[] = [
  // — Las 10 preguntas del plan —
  { id: "internet", pregunta: "¿Puedo estar en el Simplificado si vendo por internet?", fuenteEsperada: /ley-843|tomo/ },
  { id: "tienda-8000", pregunta: "Tengo una tienda de barrio y vendo como Bs 8.000 al mes, ¿qué régimen me toca?", fuenteEsperada: /ley-843/, terminosEsperados: ["simplificado"] },
  { id: "programador-exterior", pregunta: "Soy programador y facturo a clientes del exterior, ¿qué impuestos pago?", terminosEsperados: ["IVA"] },
  { id: "iva", pregunta: "¿Cuánto es el IVA en Bolivia?", terminosEsperados: ["13%", "Art. 15"], critico: true },
  { id: "periodicidad-rts", pregunta: "¿Cada cuánto se paga en el Simplificado?", terminosEsperados: ["bimestral"], critico: true },
  { id: "nit-digito-4", pregunta: "Mi NIT termina en 4, ¿cuándo vence mi declaración?", terminosEsperados: ["día 17"], critico: true },
  { id: "requisitos-nit", pregunta: "¿Qué necesito para sacar el NIT?", fuenteEsperada: /rnc-inscripcion|cartilla/ },
  { id: "tope-rts", pregunta: "¿Qué pasa si me paso del tope del Simplificado?", terminosEsperados: ["General"], fuenteEsperada: /ley-843/ },
  { id: "factura-rts", pregunta: "¿Puedo emitir factura estando en el Simplificado?", fuenteEsperada: /ley-843|rcv|tomo/ },
  { id: "rau-papa", pregunta: "Tengo un terreno y produzco papa, ¿qué régimen me corresponde?", terminosEsperados: ["agropecuario"] },
  // — Variantes coloquiales —
  { pregunta: "¿Cuánto paga el régimen simplificado?", terminosEsperados: ["47", "350", "cuota bimestral"], critico: true },
  { pregunta: "¿Cada cuánto paga una tiendita?", terminosEsperados: ["bimestral"], critico: true },
  { pregunta: "¿Cuánto me descuentan de impuestos si vendo Bs 10.000?", terminosEsperados: ["13%"] },
  { pregunta: "Tengo una tiendita chiquita, ¿cuánto pago?", terminosEsperados: ["cuota bimestral"], critico: true },
  // — Vigencia/actualidad: deben disparar el refuerzo web —
  { pregunta: "¿Cuál es la última norma vigente del RTS?", esperaWeb: true },
  { pregunta: "¿Cuál es el calendario actual de vencimientos?", esperaWeb: true },
];

/**
 * Variantes generadas con Adaption (sponsor): backend/eval/variantes-adaption.jsonl,
 * una por línea: {"semillaId": "iva", "pregunta": "¿cuánto me descuentan?"}.
 * Cada variante hereda las expectativas de su semilla — lo sintético son las
 * preguntas, nunca las respuestas.
 */
function cargarVariantesAdaption(): Caso[] {
  const ruta = join(dirname(fileURLToPath(import.meta.url)), "..", "eval", "variantes-adaption.jsonl");
  if (!existsSync(ruta)) return [];

  const porId = new Map(CASOS.filter((c) => c.id).map((c) => [c.id!, c]));
  const variantes: Caso[] = [];
  const lineas = readFileSync(ruta, "utf-8").split("\n").filter((l) => l.trim());

  for (const linea of lineas) {
    try {
      const v = JSON.parse(linea) as { semillaId?: string; pregunta?: string };
      const semilla = v.semillaId ? porId.get(v.semillaId) : undefined;
      if (!semilla || !v.pregunta?.trim()) continue;
      variantes.push({
        ...semilla,
        pregunta: v.pregunta.trim(),
        // Las variantes no bloquean el build: miden robustez, no regresiones
        critico: false,
      });
    } catch {
      // línea malformada: se ignora
    }
  }
  return variantes;
}

const VARIANTES = cargarVariantesAdaption();
const TODOS = [...CASOS, ...VARIANTES];

const TOP_K = 4;
let pasan = 0;
let fallanCriticos = 0;

console.log(`\n=== Benchmark RAG híbrido — ${CASOS.length} casos base + ${VARIANTES.length} variantes Adaption ===\n`);

for (const caso of TODOS) {
  const bloques = contextoEstructurado(caso.pregunta);
  const local = buscarNormativa({ consulta: caso.pregunta, limite: TOP_K });

  const contexto = [
    ...bloques.map((b) => `${b.fuente}\n${b.texto}`),
    ...local.fragmentos.map((f) => `${f.fuente}\n${f.texto}`),
  ].join("\n");

  const fallas: string[] = [];

  if (caso.fuenteEsperada) {
    const fuentes = [
      ...bloques.map((b) => b.fuente),
      ...local.fragmentos.map((f) => f.fuente),
    ];
    if (!fuentes.some((f) => caso.fuenteEsperada!.test(f))) {
      fallas.push(`fuente esperada ${caso.fuenteEsperada} no está en top-${TOP_K}: [${fuentes.join(", ")}]`);
    }
  }

  for (const termino of caso.terminosEsperados ?? []) {
    if (!contexto.toLowerCase().includes(termino.toLowerCase())) {
      fallas.push(`término esperado "${termino}" ausente del contexto`);
    }
  }

  if (caso.esperaWeb) {
    if (!necesitaRefuerzoWeb(caso.pregunta, local.fragmentos)) {
      fallas.push("debería disparar el refuerzo web (vigencia) y no lo hace");
    }
  }

  const ok = fallas.length === 0;
  if (ok) pasan++;
  else if (caso.critico) fallanCriticos++;

  const icono = ok ? "✓" : caso.critico ? "✗ CRÍTICO" : "✗";
  console.log(`${icono} ${caso.pregunta}`);
  for (const f of fallas) console.log(`    → ${f}`);
  if (bloques.length > 0) console.log(`    [estructurado: ${bloques.map((b) => b.fuente).join(" | ")}]`);
}

const pct = Math.round((pasan / TODOS.length) * 100);
console.log(`\n=== Resultado: ${pasan}/${TODOS.length} (${pct}%) — críticos fallados: ${fallanCriticos} ===\n`);

if (fallanCriticos > 0) {
  console.error("Hay casos CRÍTICOS fallando: montos/fechas verificados no llegan al contexto.");
  process.exit(1);
}
