/**
 * PLANILLA 5 — Categorías y cuotas del Sistema Tributario Integrado (STI).
 * Fuente: planillas/05-sti-categorias.csv
 * Corpus: D.S. N° 23027 Arts. 3–4 (en Ley 843 TO); exclusión D.S. N° 28522.
 */
import type { Fuente } from "../types/resultado";
import { FUENTE_LEY_843_STI_ART3_4, FUENTE_LEY_843_STI_ART4 } from "./verificacion";

/** Categorías de cuota del STI (tabla Art. 4). */
export type CategoriaSTI = "B" | "1" | "2";

/** Tipo de servicio de transporte (mapa Art. 3–4). */
export type TipoTransporte =
  | "taxi_vagoneta_minibus"
  | "carga_urbana"
  | "micro_bus_urbano"
  | "interprovincial"
  /** Excluido del STI → Régimen General (D.S. 28522). */
  | "interdepartamental_internacional"
  /** Flotas / radio taxis → Régimen General. */
  | "flota_radio_taxi";

/** Ubicación para el mapa de categorías STI. */
export type UbicacionSti = "capital_lp_cbba_sc" | "otros";

export interface CategoriaSTICuota {
  categoria: CategoriaSTI;
  ingresoTrimestral: number;
  impuestoTrimestral: number;
  fuente: Fuente;
}

export const CATEGORIAS_STI: CategoriaSTICuota[] = [
  {
    categoria: "B",
    ingresoTrimestral: 1000,
    impuestoTrimestral: 100,
    fuente: FUENTE_LEY_843_STI_ART4,
  },
  {
    categoria: "1",
    ingresoTrimestral: 1500,
    impuestoTrimestral: 150,
    fuente: FUENTE_LEY_843_STI_ART4,
  },
  {
    categoria: "2",
    ingresoTrimestral: 2750,
    impuestoTrimestral: 275,
    fuente: FUENTE_LEY_843_STI_ART4,
  },
];

export const CUOTA_STI_MIN = CATEGORIAS_STI[0].impuestoTrimestral;
export const CUOTA_STI_MAX = CATEGORIAS_STI[CATEGORIAS_STI.length - 1].impuestoTrimestral;

/** Servicios que el STI admite (no van al Régimen General por exclusión). */
export const TIPOS_TRANSPORTE_STI: readonly TipoTransporte[] = [
  "taxi_vagoneta_minibus",
  "carga_urbana",
  "micro_bus_urbano",
  "interprovincial",
] as const;

/** Servicios excluidos del STI → Régimen General. */
export const TIPOS_TRANSPORTE_EXCLUIDOS_STI: readonly TipoTransporte[] = [
  "interdepartamental_internacional",
  "flota_radio_taxi",
] as const;

type MapaKey = `${TipoTransporte}:${UbicacionSti}`;

/**
 * Mapa servicio × ubicación → categoría (D.S. 23027 Art. 3–4).
 * Capitales: La Paz, Cochabamba, Santa Cruz. Otros: demás deptos, El Alto, provincias.
 */
const MAPA_CATEGORIA_STI: Partial<Record<MapaKey, CategoriaSTI>> = {
  "taxi_vagoneta_minibus:capital_lp_cbba_sc": "1",
  "taxi_vagoneta_minibus:otros": "B",
  "carga_urbana:capital_lp_cbba_sc": "1",
  "carga_urbana:otros": "B",
  "micro_bus_urbano:capital_lp_cbba_sc": "2",
  "micro_bus_urbano:otros": "1",
  "interprovincial:capital_lp_cbba_sc": "2",
  "interprovincial:otros": "1",
};

export function resolverCategoriaSTI(
  tipo: TipoTransporte,
  ubicacion: UbicacionSti,
): CategoriaSTI | undefined {
  return MAPA_CATEGORIA_STI[`${tipo}:${ubicacion}`];
}

export function cuotaSTI(categoria: CategoriaSTI): CategoriaSTICuota | undefined {
  return CATEGORIAS_STI.find((c) => c.categoria === categoria);
}

export const FUENTE_MAPA_STI: Fuente = FUENTE_LEY_843_STI_ART3_4;

export const ADVERTENCIA_STI_ACTUALIZACION =
  "Los montos STI provienen del D.S. N° 23027 Art. 4 (Texto Ordenado). El Art. 10 faculta actualizarlos anualmente: confirmá la cuota vigente en el SIN.";
