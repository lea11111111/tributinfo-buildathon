/**
 * PLANILLA 6 — Cuotas fijas por hectárea del RAU, gestión 2024.
 * Cuotas: RND Nº 102500000038, vigente desde el 1 de octubre de 2025.
 * Límites: D.S. Nº 24463, Anexo I, compilado oficial del SIN a febrero de 2026.
 */
import type { Fuente } from "../types/resultado";

export type ActividadRau = "agricola" | "pecuaria";

export const LINK_RND_CUOTAS_RAU =
  "https://www.impuestos.gob.bo/wp-content/uploads/2025/10/RND-102500000038.pdf";
export const LINK_DS_24463 =
  "https://sac.impuestos.gob.bo/formularios/pdf/1.-LEY%20N%C2%B0%20843-02-26.pdf";

export const FUENTE_CUOTAS_RAU: Fuente = {
  norma: "RND Nº 102500000038",
  articulo: "Artículo Único — cuotas RAU gestión 2024",
  link: LINK_RND_CUOTAS_RAU,
};

export const FUENTE_REGLAS_RAU: Fuente = {
  norma: "D.S. Nº 24463",
  articulo: "Arts. 2, 8, 10, 13 y 15; Anexo I",
  link: LINK_DS_24463,
};

export interface CuotaRau {
  id: string;
  zona: string;
  subzona: string;
  claseTierra: string;
  cuotaAgricola: number;
  /** `null` indica que la combinación no aplica, no una cuota cero. */
  cuotaPecuaria: number | null;
  minimoAgricola: number | null;
  maximoAgricola: number;
  minimoPecuario: number | null;
  maximoPecuario: number | null;
}

export const CUOTAS_RAU: CuotaRau[] = [
  {
    id: "altiplano-norte-riberena-titicaca",
    zona: "Altiplano y Puna",
    subzona: "Norte",
    claseTierra: "Ribereña al Lago Titicaca",
    cuotaAgricola: 49.06,
    cuotaPecuaria: 3.03,
    minimoAgricola: 10,
    maximoAgricola: 160,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "altiplano-norte-influencia-titicaca",
    zona: "Altiplano y Puna",
    subzona: "Norte",
    claseTierra: "Con influencia del Lago Titicaca",
    cuotaAgricola: 44.34,
    cuotaPecuaria: 3.03,
    minimoAgricola: 10,
    maximoAgricola: 160,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "altiplano-norte-sin-influencia-titicaca",
    zona: "Altiplano y Puna",
    subzona: "Norte",
    claseTierra: "Sin influencia del Lago Titicaca",
    cuotaAgricola: 34.77,
    cuotaPecuaria: 3.03,
    minimoAgricola: 20,
    maximoAgricola: 300,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "altiplano-central-influencia-poopo",
    zona: "Altiplano y Puna",
    subzona: "Central",
    claseTierra: "Con influencia del Lago Poopó",
    cuotaAgricola: 36.72,
    cuotaPecuaria: 3.15,
    minimoAgricola: 15,
    maximoAgricola: 240,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "altiplano-central-sin-influencia-poopo",
    zona: "Altiplano y Puna",
    subzona: "Central",
    claseTierra: "Sin influencia del Lago Poopó",
    cuotaAgricola: 28.51,
    cuotaPecuaria: 1.62,
    minimoAgricola: 30,
    maximoAgricola: 500,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "altiplano-sur-semidesertica",
    zona: "Altiplano y Puna",
    subzona: "Sur",
    claseTierra: "Sur y semidesértica",
    cuotaAgricola: 15.87,
    cuotaPecuaria: 1.78,
    minimoAgricola: 35,
    maximoAgricola: 700,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "altiplano-sur-andina",
    zona: "Altiplano y Puna",
    subzona: "Sur",
    claseTierra: "Andina, altiplano y puna",
    cuotaAgricola: 15.87,
    cuotaPecuaria: 1.78,
    minimoAgricola: 35,
    maximoAgricola: 700,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-cochabamba-riego",
    zona: "Valles",
    subzona: "Abiertos adyacentes a Cochabamba",
    claseTierra: "Riego",
    cuotaAgricola: 136.96,
    cuotaPecuaria: 6.17,
    minimoAgricola: 6,
    maximoAgricola: 100,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-cochabamba-secano",
    zona: "Valles",
    subzona: "Abiertos adyacentes a Cochabamba",
    claseTierra: "Secano",
    cuotaAgricola: 45.54,
    cuotaPecuaria: 1.57,
    minimoAgricola: 12,
    maximoAgricola: 200,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-cochabamba-viticola",
    zona: "Valles",
    subzona: "Abiertos adyacentes a Cochabamba",
    claseTierra: "Vinícola",
    cuotaAgricola: 155.07,
    cuotaPecuaria: null,
    minimoAgricola: 3,
    maximoAgricola: 48,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-abiertos-riego",
    zona: "Valles",
    subzona: "Otros valles abiertos",
    claseTierra: "Riego",
    cuotaAgricola: 136.96,
    cuotaPecuaria: 6.17,
    minimoAgricola: 6,
    maximoAgricola: 120,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-abiertos-secano",
    zona: "Valles",
    subzona: "Otros valles abiertos",
    claseTierra: "Secano",
    cuotaAgricola: 45.54,
    cuotaPecuaria: 1.57,
    minimoAgricola: 12,
    maximoAgricola: 300,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-abiertos-viticola",
    zona: "Valles",
    subzona: "Otros valles abiertos",
    claseTierra: "Vinícola",
    cuotaAgricola: 155.07,
    cuotaPecuaria: null,
    minimoAgricola: 3,
    maximoAgricola: 48,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-cerrados-serranias",
    zona: "Valles",
    subzona: "Valles cerrados",
    claseTierra: "En valles y serranías",
    cuotaAgricola: 65.93,
    cuotaPecuaria: 2.9,
    minimoAgricola: null,
    maximoAgricola: 160,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-cerrados-riego",
    zona: "Valles",
    subzona: "Otros valles cerrados",
    claseTierra: "Riego",
    cuotaAgricola: 142.64,
    cuotaPecuaria: 5.84,
    minimoAgricola: 4,
    maximoAgricola: 60,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-cerrados-secano",
    zona: "Valles",
    subzona: "Otros valles cerrados",
    claseTierra: "Secano",
    cuotaAgricola: 65.93,
    cuotaPecuaria: 2.9,
    minimoAgricola: 8,
    maximoAgricola: 120,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "valles-cerrados-viticola",
    zona: "Valles",
    subzona: "Otros valles cerrados",
    claseTierra: "Vinícola",
    cuotaAgricola: 155.07,
    cuotaPecuaria: null,
    minimoAgricola: 3,
    maximoAgricola: 48,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "cabecera-valle-secano",
    zona: "Valles",
    subzona: "Cabecera de valle",
    claseTierra: "Secano",
    cuotaAgricola: 21.8,
    cuotaPecuaria: 1.7,
    minimoAgricola: 20,
    maximoAgricola: 400,
    minimoPecuario: null,
    maximoPecuario: null,
  },
  {
    id: "subtropical-yungas",
    zona: "Subtropical",
    subzona: "Yungas",
    claseTierra: "Yungas",
    cuotaAgricola: 57.44,
    cuotaPecuaria: 3.03,
    minimoAgricola: 10,
    maximoAgricola: 300,
    minimoPecuario: 500,
    maximoPecuario: 10000,
  },
  {
    id: "subtropical-santa-cruz",
    zona: "Subtropical",
    subzona: "Santa Cruz",
    claseTierra: "Santa Cruz",
    cuotaAgricola: 35.51,
    cuotaPecuaria: 2.61,
    minimoAgricola: 50,
    maximoAgricola: 1000,
    minimoPecuario: 500,
    maximoPecuario: 10000,
  },
  {
    id: "subtropical-chaco",
    zona: "Subtropical",
    subzona: "Chaco",
    claseTierra: "Chaco",
    cuotaAgricola: 3.69,
    cuotaPecuaria: 1.37,
    minimoAgricola: 80,
    maximoAgricola: 1200,
    minimoPecuario: 500,
    maximoPecuario: 10000,
  },
  {
    id: "tropical-beni-pando-iturralde",
    zona: "Tropical",
    subzona: "Beni, Pando e Iturralde",
    claseTierra: "Beni, Pando y provincia Iturralde",
    cuotaAgricola: 32.57,
    cuotaPecuaria: 2.61,
    minimoAgricola: 50,
    maximoAgricola: 1000,
    minimoPecuario: 500,
    maximoPecuario: 10000,
  },
];

export function buscarCuotaRau(id?: string): CuotaRau | undefined {
  return CUOTAS_RAU.find((cuota) => cuota.id === id);
}

export function limitesRau(cuota: CuotaRau, actividad: ActividadRau) {
  return actividad === "agricola"
    ? { minimo: cuota.minimoAgricola, maximo: cuota.maximoAgricola }
    : { minimo: cuota.minimoPecuario, maximo: cuota.maximoPecuario };
}
