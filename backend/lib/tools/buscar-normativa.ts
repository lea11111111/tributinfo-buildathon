import { searchCorpus } from "../rag/tfidf";
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

export function buscarNormativa(input: BuscarNormativaInput): BuscarNormativaResultado {
  const limite = input.limite ?? 4;
  const hits = searchCorpus(input.consulta, limite);

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

/**
 * Si el corpus local no da resultados con score decente, refuerza con
 * búsqueda web restringida a impuestos.gob.bo vía Exa (sponsor).
 * Sin EXA_API_KEY, o si Exa falla o tarda, devuelve lo local sin más.
 */
const UMBRAL_SCORE_WEB = 0.2;

export async function buscarNormativaConWeb(
  input: BuscarNormativaInput,
): Promise<BuscarNormativaResultado> {
  const local = buscarNormativa(input);
  const mejorScore = local.fragmentos[0]?.score ?? 0;
  if (mejorScore >= UMBRAL_SCORE_WEB) return local;

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
