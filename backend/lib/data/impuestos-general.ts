/**
 * PLANILLA 2 de Fernanda — Impuestos del Régimen General.
 *
 * ⚠️ ALÍCUOTAS PLACEHOLDER. Reemplazar con la planilla de Fernanda
 * (Ley 843 y normas conexas) ANTES de la demo.
 */
import type { Fuente } from "../types/resultado";
import { FUENTE_PENDIENTE } from "./verificacion";

export interface ImpuestoGeneral {
  impuesto: string;
  sigla: string;
  /** Alícuota como fracción, p. ej. 0.13 = 13% */
  alicuota: number;
  periodicidad: "mensual" | "anual";
  baseCalculo: string;
  fuente: Fuente;
}

// TODO_FERNANDA: reemplazar alícuotas y bases con planilla 2
export const IMPUESTOS_GENERAL: ImpuestoGeneral[] = [
  {
    impuesto: "Impuesto al Valor Agregado",
    sigla: "IVA",
    alicuota: 0.1, // PLACEHOLDER
    periodicidad: "mensual",
    baseCalculo: "ventas del período",
    fuente: FUENTE_PENDIENTE,
  },
  {
    impuesto: "Impuesto a las Transacciones",
    sigla: "IT",
    alicuota: 0.01, // PLACEHOLDER
    periodicidad: "mensual",
    baseCalculo: "ingresos brutos del período",
    fuente: FUENTE_PENDIENTE,
  },
  {
    impuesto: "Impuesto sobre las Utilidades de las Empresas",
    sigla: "IUE",
    alicuota: 0.2, // PLACEHOLDER
    periodicidad: "anual",
    baseCalculo: "utilidad neta anual",
    fuente: FUENTE_PENDIENTE,
  },
];
