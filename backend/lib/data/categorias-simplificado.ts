/**
 * PLANILLA 1 de Fernanda — Categorías del Régimen Tributario Simplificado (RTS).
 *
 * ⚠️ TODOS LOS VALORES SON PLACEHOLDER (números redondos inventados solo para
 * que el código compile y se pueda probar el flujo). Reemplazar cada fila con
 * la planilla de Fernanda ANTES de la demo, incluyendo norma/artículo/link.
 */
import type { Fuente } from "../types/resultado";
import { FUENTE_PENDIENTE } from "./verificacion";

export interface CategoriaRTS {
  categoria: number;
  capitalDesde: number; // Bs
  capitalHasta: number; // Bs (inclusive)
  ventasAnualesHasta: number; // Bs (inclusive)
  cuotaBimestral: number; // Bs
  fuente: Fuente;
}

// TODO_FERNANDA: reemplazar con planilla 1 (RND vigente de categorías RTS)
export const CATEGORIAS_RTS: CategoriaRTS[] = [
  { categoria: 1, capitalDesde: 1, capitalHasta: 10000, ventasAnualesHasta: 50000, cuotaBimestral: 100, fuente: FUENTE_PENDIENTE },
  { categoria: 2, capitalDesde: 10001, capitalHasta: 20000, ventasAnualesHasta: 100000, cuotaBimestral: 200, fuente: FUENTE_PENDIENTE },
  { categoria: 3, capitalDesde: 20001, capitalHasta: 30000, ventasAnualesHasta: 150000, cuotaBimestral: 300, fuente: FUENTE_PENDIENTE },
  { categoria: 4, capitalDesde: 30001, capitalHasta: 40000, ventasAnualesHasta: 200000, cuotaBimestral: 400, fuente: FUENTE_PENDIENTE },
  { categoria: 5, capitalDesde: 40001, capitalHasta: 50000, ventasAnualesHasta: 250000, cuotaBimestral: 500, fuente: FUENTE_PENDIENTE },
];

/** Tope máximo de capital del RTS: por encima, Régimen General */
export const CAPITAL_MAXIMO_RTS = CATEGORIAS_RTS[CATEGORIAS_RTS.length - 1].capitalHasta;

/** Tope máximo de ventas anuales del RTS */
export const VENTAS_MAXIMAS_RTS = CATEGORIAS_RTS[CATEGORIAS_RTS.length - 1].ventasAnualesHasta;

/**
 * Actividades que el RTS admite (comerciantes minoristas, artesanos, vivanderas).
 * TODO_FERNANDA: confirmar lista y exclusiones con la norma.
 */
export const ACTIVIDADES_RTS = ["comercio_minorista", "artesania", "vivandera"] as const;
