/**
 * Estado de verificación de los datos tributarios.
 *
 * REGLA DEL EQUIPO: ningún número sale de la memoria ni de una IA.
 * Todos los montos de lib/data/ deben copiarse de planillas/ (que citan
 * norma, artículo y link oficial del SIN).
 *
 * DATOS_VERIFICADOS = true cuando las planillas están cargadas desde el corpus.
 * Planilla 4 usa el Anexo Técnico RNC (siatinfo) + RND 102500000017 / 102600000002;
 * el PDF catalogado ANEXO-NIT.pdf NO es la guía de inscripción (ver corpus/parsed/10-…).
 */
export const DATOS_VERIFICADOS = true;

export const ADVERTENCIA_DATOS_NO_VERIFICADOS =
  "DATOS PLACEHOLDER: los montos NO fueron verificados contra las planillas. NO usar en demo.";

/** Usar solo cuando aún no hay una cita oficial cargada. */
export const FUENTE_PENDIENTE = {
  norma: "NO ENCONTRADO",
  articulo: "NO ENCONTRADO",
  link: "NO ENCONTRADO",
};

export const LINK_LEY_843 =
  "https://sac.impuestos.gob.bo/formularios/pdf/LEY%20843-09-22.pdf";

export const FUENTE_LEY_843_RTS_ART17 = {
  norma: "D.S. N° 24484 (en Ley 843 TO) mod. D.S. N° 3698",
  articulo: "Art. 17",
  link: LINK_LEY_843,
};

export const FUENTE_LEY_843_RTS_ART18 = {
  norma: "D.S. N° 24484 (en Ley 843 TO) mod. D.S. N° 3698",
  articulo: "Art. 18",
  link: LINK_LEY_843,
};

export const FUENTE_LEY_843_RTS_ART19 = {
  norma: "D.S. N° 24484 (en Ley 843 TO)",
  articulo: "Art. 19",
  link: LINK_LEY_843,
};

export const FUENTE_LEY_843_STI_ART3_4 = {
  norma: "D.S. N° 23027 (en Ley 843 TO)",
  articulo: "Art. 3–4",
  link: LINK_LEY_843,
};

export const FUENTE_LEY_843_STI_ART4 = {
  norma: "D.S. N° 23027 (en Ley 843 TO)",
  articulo: "Art. 4",
  link: LINK_LEY_843,
};

export const FUENTE_LEY_843_STI_ART9 = {
  norma: "D.S. N° 23027 (en Ley 843 TO)",
  articulo: "Art. 9",
  link: LINK_LEY_843,
};

/** Exclusión de transporte interdepartamental/internacional del STI (D.S. 28522). */
export const FUENTE_LEY_843_STI_EXCLUSION = {
  norma: "D.S. N° 28522 (en Ley 843 TO)",
  articulo: "Art. único (exclusión STI)",
  link: LINK_LEY_843,
};

export const FUENTE_VENCIMIENTO_DIGITO_NIT = {
  norma: "Ley 843 / Reglamento IVA e IT",
  articulo: "Regl. IVA Art. 10; Regl. IT Art. 7",
  link: LINK_LEY_843,
};
