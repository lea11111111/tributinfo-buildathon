import { searchCorpus, tokenize } from "../rag/tfidf";
import { searchExaSin } from "../ai/exa";

export interface BuscarNormativaInput {
  consulta: string;
  limite?: number;
}

export interface BuscarNormativaResultado {
  consulta: string;
  fragmentos: Array<{
    fuente: string;
    chunkIndex: number;
    score: number;
    texto: string;
    /** Resumen corto para el panel de tools */
    resumen: string;
    /** Solo presente en resultados web (fallback Exa) */
    url?: string;
  }>;
  resumen: string;
}

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

/**
 * El usuario real no habla como la norma. Expandimos coloquialismos hacia el
 * vocabulario técnico del corpus para que TF-IDF tenga con qué matchear.
 */
const EXPANSIONES: Array<{ patron: RegExp; terminos: string }> = [
  { patron: /(cuanto (se )?paga|cuanto pagar|cuanto cuesta|cuanto me (toca|sale|descuentan))/, terminos: "cuota bimestral monto alicuota" },
  { patron: /(simplificad|tiendit|tienda de barrio|negocio pequen|vendo poco)/, terminos: "regimen tributario simplificado RTS comerciante minorista categoria" },
  { patron: /(sacar|obtener|tramitar|necesito|inscrib).{0,25}\bnit\b|\bnit\b.{0,15}(sacar|requisit)/, terminos: "inscripcion registro nacional contribuyentes RNC requisitos cedula identidad" },
  { patron: /(vence|vencimiento|cuando pago|fecha de pago)/, terminos: "vencimiento ultimo digito NIT declaracion pago" },
  { patron: /(terreno|cultivo|produzco|papa|agricultor|campo|cosecha|ganado)/, terminos: "regimen agropecuario unificado RAU actividad agricola" },
  { patron: /(taxi|micro|transport|chofer|flota)/, terminos: "sistema tributario integrado STI transporte publico" },
  { patron: /\biva\b/, terminos: "impuesto valor agregado alicuota debito fiscal" },
  { patron: /factur/, terminos: "factura nota fiscal emision dosificacion" },
  { patron: /(me paso|supero|excedo).{0,20}(tope|limite)|(tope|limite).{0,20}(simplificado|rts)/, terminos: "exclusion cambio regimen general tope capital ventas" },
];

export function expandirConsulta(consulta: string): string {
  const q = normalizar(consulta);
  const extra = EXPANSIONES.filter((e) => e.patron.test(q))
    .map((e) => e.terminos)
    .join(" ");
  return extra ? `${consulta} ${extra}` : consulta;
}

/**
 * No todo el corpus pesa igual: la Ley 843 y las guías específicas responden
 * mejor que los compendios (ruidosos y enormes). Boost/penalización por fuente.
 */
const PESO_POR_FUENTE: Array<{ patron: RegExp; peso: number }> = [
  { patron: /02-ley-843/, peso: 1.3 },
  { patron: /04-calendario/, peso: 1.25 },
  { patron: /10-rnc-inscripcion/, peso: 1.6 },
  { patron: /05-cartilla/, peso: 1.1 },
  { patron: /0[78]-tomo/, peso: 0.85 },
];

function pesoFuente(source: string): number {
  for (const { patron, peso } of PESO_POR_FUENTE) {
    if (patron.test(source)) return peso;
  }
  return 1;
}

export function buscarNormativa(input: BuscarNormativaInput): BuscarNormativaResultado {
  const limite = input.limite ?? 4;
  const consultaExpandida = expandirConsulta(input.consulta);

  // Pedimos de más, re-rankeamos por peso de fuente y recortamos.
  const hits = searchCorpus(consultaExpandida, limite * 3)
    .map((hit) => ({ ...hit, score: hit.score * pesoFuente(hit.source) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limite);

  const fragmentos = hits.map((hit) => ({
    fuente: hit.source,
    chunkIndex: hit.chunkIndex,
    score: Number(hit.score.toFixed(4)),
    texto: hit.text,
    resumen: `${hit.source} (chunk ${hit.chunkIndex})`,
  }));

  const resumen =
    fragmentos.length > 0
      ? fragmentos.map((f) => f.fuente).join(", ")
      : "Sin resultados en el corpus";

  return {
    consulta: input.consulta,
    fragmentos,
    resumen,
  };
}

const UMBRAL_SCORE_WEB = 0.2;
const RE_VIGENCIA = /(ultim[ao]|vigente|actual|nuev[ao]|recien|este ano|2026)/;

/**
 * Decide si la evidencia local es débil y conviene reforzar con la web oficial:
 * score bajo, términos clave de la consulta ausentes del top, o pedido
 * explícito de vigencia/actualidad (el corpus es una foto, la web no).
 */
export function necesitaRefuerzoWeb(
  consulta: string,
  fragmentos: BuscarNormativaResultado["fragmentos"],
): boolean {
  const mejorScore = fragmentos[0]?.score ?? 0;
  if (mejorScore < UMBRAL_SCORE_WEB) return true;

  if (RE_VIGENCIA.test(normalizar(consulta))) return true;

  // ¿El top local contiene al menos parte de los términos de la consulta?
  const terminos = tokenize(expandirConsulta(consulta));
  if (terminos.length === 0) return false;
  const textoTop = normalizar(fragmentos.slice(0, 2).map((f) => f.texto).join(" "));
  const presentes = terminos.filter((t) => textoTop.includes(t)).length;
  return presentes / terminos.length < 0.3;
}

/**
 * Si el corpus local no da evidencia sólida, refuerza con búsqueda web
 * restringida a impuestos.gob.bo vía Exa (sponsor).
 * Sin EXA_API_KEY, o si Exa falla o tarda, devuelve lo local sin más.
 */
export async function buscarNormativaConWeb(
  input: BuscarNormativaInput,
): Promise<BuscarNormativaResultado> {
  const local = buscarNormativa(input);
  if (!necesitaRefuerzoWeb(input.consulta, local.fragmentos)) return local;

  const web = await searchExaSin(input.consulta);
  if (web.length === 0) return local;

  const fragmentosWeb = web.map((w) => ({
    fuente: `${w.titulo} (web oficial SIN)`,
    chunkIndex: -1,
    score: 0,
    texto: w.texto,
    resumen: `web SIN: ${w.titulo}`,
    url: w.url,
  }));

  return {
    consulta: local.consulta,
    fragmentos: [...local.fragmentos, ...fragmentosWeb],
    resumen: `${local.resumen} + web oficial SIN (Exa)`,
  };
}
