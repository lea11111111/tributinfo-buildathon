/**
 * PLANILLA 1 — Categorías del Régimen Tributario Simplificado (RTS).
 * Fuente: planillas/01-rts-categorias.csv
 * Corpus: D.S. N° 24484 Art. 17/18 (en Ley 843 TO), mod. D.S. N° 3698.
 */
import type { Fuente } from "../types/resultado";
import { FUENTE_LEY_843_RTS_ART17 } from "./verificacion";

export interface CategoriaRTS {
  categoria: number;
  capitalDesde: number; // Bs
  capitalHasta: number; // Bs (inclusive)
  /** Tope global de ventas anuales del RTS (Art. 18), no varía por categoría */
  ventasAnualesHasta: number; // Bs (inclusive)
  cuotaBimestral: number; // Bs
  fuente: Fuente;
}

export const CATEGORIAS_RTS: CategoriaRTS[] = [
  {
    categoria: 1,
    capitalDesde: 12001,
    capitalHasta: 15000,
    ventasAnualesHasta: 184000,
    cuotaBimestral: 47,
    fuente: FUENTE_LEY_843_RTS_ART17,
  },
  {
    categoria: 2,
    capitalDesde: 15001,
    capitalHasta: 18700,
    ventasAnualesHasta: 184000,
    cuotaBimestral: 90,
    fuente: FUENTE_LEY_843_RTS_ART17,
  },
  {
    categoria: 3,
    capitalDesde: 18701,
    capitalHasta: 23500,
    ventasAnualesHasta: 184000,
    cuotaBimestral: 147,
    fuente: FUENTE_LEY_843_RTS_ART17,
  },
  {
    categoria: 4,
    capitalDesde: 23501,
    capitalHasta: 29500,
    ventasAnualesHasta: 184000,
    cuotaBimestral: 158,
    fuente: FUENTE_LEY_843_RTS_ART17,
  },
  {
    categoria: 5,
    capitalDesde: 29501,
    capitalHasta: 37000,
    ventasAnualesHasta: 184000,
    cuotaBimestral: 200,
    fuente: FUENTE_LEY_843_RTS_ART17,
  },
  {
    categoria: 6,
    capitalDesde: 37001,
    capitalHasta: 60000,
    ventasAnualesHasta: 184000,
    cuotaBimestral: 350,
    fuente: FUENTE_LEY_843_RTS_ART17,
  },
];

/** Capital Bs1–12.000: excluidos del RTS (Art. 18) */
export const CAPITAL_MINIMO_RTS = CATEGORIAS_RTS[0].capitalDesde;

/** Tope máximo de capital del RTS: por encima, Régimen General */
export const CAPITAL_MAXIMO_RTS = CATEGORIAS_RTS[CATEGORIAS_RTS.length - 1].capitalHasta;

/** Tope máximo de ventas anuales del RTS */
export const VENTAS_MAXIMAS_RTS = CATEGORIAS_RTS[CATEGORIAS_RTS.length - 1].ventasAnualesHasta;

/**
 * Actividades que el RTS admite (comerciantes minoristas, artesanos, vivanderas).
 * D.S. 24484 Arts. 4–6.
 */
export const ACTIVIDADES_RTS = ["comercio_minorista", "artesania", "vivandera"] as const;
