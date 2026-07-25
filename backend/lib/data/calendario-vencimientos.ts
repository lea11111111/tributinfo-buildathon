/**
 * PLANILLA 3 de Fernanda — Calendario de vencimientos por último dígito de NIT.
 *
 * ⚠️ DÍAS PLACEHOLDER. Reemplazar con el calendario oficial vigente del SIN
 * ANTES de la demo.
 */
import type { Fuente } from "../types/resultado";
import { FUENTE_PENDIENTE } from "./verificacion";

export interface ReglaVencimiento {
  ultimoDigitoNit: number;
  /** Día del mes en que vence la declaración */
  diaVencimiento: number;
  fuente: Fuente;
}

// TODO_FERNANDA: reemplazar con planilla 3 (día real por dígito de NIT)
export const VENCIMIENTOS_POR_DIGITO: ReglaVencimiento[] = [
  { ultimoDigitoNit: 0, diaVencimiento: 13, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 1, diaVencimiento: 14, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 2, diaVencimiento: 15, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 3, diaVencimiento: 16, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 4, diaVencimiento: 17, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 5, diaVencimiento: 18, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 6, diaVencimiento: 19, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 7, diaVencimiento: 20, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 8, diaVencimiento: 21, fuente: FUENTE_PENDIENTE },
  { ultimoDigitoNit: 9, diaVencimiento: 22, fuente: FUENTE_PENDIENTE },
];

/**
 * Qué se declara y con qué frecuencia según el régimen.
 * TODO_FERNANDA: confirmar meses de pago del Simplificado (bimestres) y
 * si STI/RAU tienen calendario propio.
 */
export interface ObligacionPeriodica {
  regimen: "General" | "Simplificado" | "STI" | "RAU";
  concepto: string;
  /** Meses del año en que vence (1-12) */
  meses: number[];
  fuente: Fuente;
}

export const OBLIGACIONES: ObligacionPeriodica[] = [
  {
    regimen: "General",
    concepto: "Declaración y pago IVA e IT",
    meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    fuente: FUENTE_PENDIENTE,
  },
  {
    regimen: "Simplificado",
    concepto: "Pago de cuota bimestral RTS",
    // PLACEHOLDER: pares = vencimiento del bimestre anterior
    meses: [2, 4, 6, 8, 10, 12],
    fuente: FUENTE_PENDIENTE,
  },
  {
    regimen: "STI",
    concepto: "Pago trimestral STI",
    meses: [3, 6, 9, 12], // PLACEHOLDER
    fuente: FUENTE_PENDIENTE,
  },
  {
    regimen: "RAU",
    concepto: "Pago anual RAU",
    meses: [10], // PLACEHOLDER
    fuente: FUENTE_PENDIENTE,
  },
];
