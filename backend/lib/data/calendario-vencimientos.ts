/**
 * PLANILLA 3 — Calendario de vencimientos.
 * Fuente: planillas/03-calendario-vencimientos.csv
 */
import type { Fuente } from "../types/resultado";
import {
  FUENTE_LEY_843_RTS_ART19,
  FUENTE_PENDIENTE,
  FUENTE_VENCIMIENTO_DIGITO_NIT,
} from "./verificacion";

export interface ReglaVencimiento {
  ultimoDigitoNit: number;
  /** Día del mes en que vence la declaración (General: IVA/IT) */
  diaVencimiento: number;
  fuente: Fuente;
}

export const VENCIMIENTOS_POR_DIGITO: ReglaVencimiento[] = [
  { ultimoDigitoNit: 0, diaVencimiento: 13, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 1, diaVencimiento: 14, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 2, diaVencimiento: 15, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 3, diaVencimiento: 16, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 4, diaVencimiento: 17, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 5, diaVencimiento: 18, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 6, diaVencimiento: 19, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 7, diaVencimiento: 20, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 8, diaVencimiento: 21, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
  { ultimoDigitoNit: 9, diaVencimiento: 22, fuente: FUENTE_VENCIMIENTO_DIGITO_NIT },
];

/**
 * Qué se declara y con qué frecuencia según el régimen.
 * Si `diaVencimientoFijo` está definido, se usa ese día en lugar del dígito NIT.
 */
export interface ObligacionPeriodica {
  regimen: "General" | "Simplificado" | "STI" | "RAU";
  concepto: string;
  /** Meses del año en que vence (1-12) */
  meses: number[];
  /** Día fijo (p. ej. RTS Art. 19 = día 10). Si falta, se usa el dígito NIT. */
  diaVencimientoFijo?: number;
  fuente: Fuente;
}

export const OBLIGACIONES: ObligacionPeriodica[] = [
  {
    regimen: "General",
    concepto: "Declaración y pago IVA e IT",
    meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    fuente: FUENTE_VENCIMIENTO_DIGITO_NIT,
  },
  {
    regimen: "Simplificado",
    concepto: "Pago de cuota bimestral RTS",
    // Art. 19: marzo, mayo, julio, septiembre, noviembre y enero (este último del año siguiente)
    meses: [3, 5, 7, 9, 11, 1],
    diaVencimientoFijo: 10,
    fuente: FUENTE_LEY_843_RTS_ART19,
  },
  {
    regimen: "STI",
    concepto: "Pago trimestral STI",
    meses: [3, 6, 9, 12],
    fuente: FUENTE_PENDIENTE,
  },
  {
    regimen: "RAU",
    concepto: "Pago anual RAU",
    meses: [10],
    fuente: FUENTE_PENDIENTE,
  },
];
