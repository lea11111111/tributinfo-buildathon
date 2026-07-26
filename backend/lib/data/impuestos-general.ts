/**
 * PLANILLA 2 — Impuestos del Régimen General.
 * Fuente: planillas/02-impuestos-general.csv (Ley 843 Arts. 15, 75, 50).
 */
import type { Fuente } from "../types/resultado";
import { LINK_LEY_843 } from "./verificacion";

export interface ImpuestoGeneral {
  impuesto: string;
  sigla: string;
  /** Alícuota como fracción, p. ej. 0.13 = 13% */
  alicuota: number;
  periodicidad: "mensual" | "anual";
  baseCalculo: string;
  fuente: Fuente;
}

export const IMPUESTOS_GENERAL: ImpuestoGeneral[] = [
  {
    impuesto: "Impuesto al Valor Agregado",
    sigla: "IVA",
    alicuota: 0.13,
    periodicidad: "mensual",
    baseCalculo: "Precios netos de ventas/servicios del período (débito fiscal)",
    fuente: {
      norma: "Ley 843 (Texto Ordenado)",
      articulo: "Art. 15 (alícuota); Art. 10 (período mensual)",
      link: LINK_LEY_843,
    },
  },
  {
    impuesto: "Impuesto a las Transacciones",
    sigla: "IT",
    alicuota: 0.03,
    periodicidad: "mensual",
    baseCalculo: "Ingresos brutos del período",
    fuente: {
      norma: "Ley 843 (Texto Ordenado)",
      articulo: "Art. 75; Regl. IT Art. 7 (pago por dígito NIT)",
      link: LINK_LEY_843,
    },
  },
  {
    impuesto: "Impuesto sobre las Utilidades de las Empresas",
    sigla: "IUE",
    alicuota: 0.25,
    periodicidad: "anual",
    baseCalculo: "Utilidad neta imponible de la gestión",
    fuente: {
      norma: "Ley 843 (Texto Ordenado)",
      articulo: "Art. 50",
      link: LINK_LEY_843,
    },
  },
];
