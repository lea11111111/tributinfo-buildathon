/**
 * Cliente mínimo de Exa (sponsor) para búsqueda web restringida al dominio
 * oficial del SIN. Se activa solo si EXA_API_KEY está en el .env; sin key
 * devuelve [] y buscar_normativa sigue 100% local.
 *
 * Regla del equipo: lo que venga de acá es SOLO para citas y explicaciones.
 * Ningún monto de la web entra a un cálculo — eso sale de lib/data/.
 */

export type ExaResultado = {
  titulo: string;
  url: string;
  texto: string;
};

const EXA_TIMEOUT_MS = 4000;

export async function searchExaSin(
  query: string,
  numResults = 3,
): Promise<ExaResultado[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXA_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        query,
        type: "auto",
        numResults,
        includeDomains: ["impuestos.gob.bo"],
        contents: { highlights: { query, maxCharacters: 800 } },
      }),
      signal: controller.signal,
    });

    if (!res.ok) return [];

    const data = (await res.json()) as {
      results?: Array<{ title?: string; url?: string; highlights?: string[] }>;
    };

    const vistos = new Set<string>();
    return (data.results ?? [])
      .filter((r) => {
        if (!r.url || (r.highlights?.length ?? 0) === 0) return false;
        if (vistos.has(r.url)) return false;
        vistos.add(r.url);
        return true;
      })
      .map((r) => ({
        titulo: r.title ?? r.url!,
        url: r.url!,
        texto: r.highlights!.join(" … "),
      }));
  } catch {
    // Timeout o red caída: degradar en silencio, la demo sigue con lo local.
    return [];
  } finally {
    clearTimeout(timer);
  }
}
