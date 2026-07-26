/** Inputs de cada tool. Leandro usa estos tipos para los schemas de Zod del agente. */

import type { CategoriaSTI, TipoTransporte, UbicacionSti } from "../data/categorias-sti";

export type Actividad =
  | "comercio_minorista" // tienda de barrio, kiosco
  | "artesania"
  | "vivandera" // venta de comida
  | "servicios"
  | "profesional_independiente" // freelancer, consultor
  | "transporte" // candidato a STI
  | "agropecuaria" // candidato a RAU
  | "otro";

export type TipoClientes = "consumidor_final" | "empresas" | "exterior" | "mixto";

export type { CategoriaSTI, TipoTransporte, UbicacionSti };

export interface ClasificarRegimenInput {
  actividad: Actividad;
  /** Capital de trabajo en Bs */
  capital: number;
  /** Ventas anuales estimadas en Bs */
  ventasAnuales: number;
  tipoClientes: TipoClientes;
  /** Tipo de servicio (transporte → STI o General por exclusión) */
  tipoTransporte?: TipoTransporte;
  /** Ubicación para mapa de categorías STI */
  ubicacionSti?: UbicacionSti;
  /** Datos de superficie para validar los límites del RAU. */
  actividadRau?: "agricola" | "pecuaria";
  hectareasRau?: number;
  zonaRau?: string;
}

export interface CalcularImpuestosInput {
  regimen: "General" | "Simplificado" | "STI" | "RAU";
  /** Ventas mensuales en Bs */
  ventasMensuales: number;
  /** Requerida si regimen = Simplificado */
  categoria?: number;
  /** Categoría STI ("B" | "1" | "2"); si falta, se informa el rango sin inventar */
  categoriaSti?: CategoriaSTI;
  /** Datos necesarios para estimar la cuota anual del RAU. */
  actividadRau?: "agricola" | "pecuaria";
  hectareasRau?: number;
  zonaRau?: string;
  certificadoNoImponibilidadRau?: "si" | "no_no_se";
}

export interface GenerarCalendarioInput {
  regimen: "General" | "Simplificado" | "STI" | "RAU";
  /** 0-9 */
  ultimoDigitoNit: number;
  /** Año del calendario, default: año en curso */
  anio?: number;
}

export interface EnviarRecordatorioInput {
  /** Chat ID de Telegram, o celular +591… si ZAVU_CHANNEL=sms/whatsapp */
  telefono: string;
  regimen: string;
  /** Próximo vencimiento en ISO, p. ej. "2026-08-15" */
  proximoVencimiento: string;
  /** Qué se paga/declara en ese vencimiento */
  concepto: string;
  /** Link público de descarga del .ics (debe ser HTTPS en producción) */
  linkCalendario?: string;
}
