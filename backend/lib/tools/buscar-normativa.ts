import { searchCorpus } from "../rag/tfidf";

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
