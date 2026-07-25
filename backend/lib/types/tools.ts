/** Inputs de cada tool. Leandro usa estos tipos para los schemas de Zod del agente. */

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

export interface ClasificarRegimenInput {
  actividad: Actividad;
  /** Capital de trabajo en Bs */
  capital: number;
  /** Ventas anuales estimadas en Bs */
  ventasAnuales: number;
  tipoClientes: TipoClientes;
}

export interface CalcularImpuestosInput {
  regimen: "General" | "Simplificado" | "STI" | "RAU";
  /** Ventas mensuales en Bs */
  ventasMensuales: number;
  /** Requerida si regimen = Simplificado */
  categoria?: number;
}

export interface GenerarCalendarioInput {
  regimen: "General" | "Simplificado" | "STI" | "RAU";
  /** 0-9 */
  ultimoDigitoNit: number;
  /** Año del calendario, default: año en curso */
  anio?: number;
}

export interface EnviarRecordatorioInput {
  /** Acepta formatos locales; se normaliza a +591XXXXXXXX */
  telefono: string;
  regimen: string;
  /** Próximo vencimiento en ISO, p. ej. "2026-08-15" */
  proximoVencimiento: string;
  /** Qué se paga/declara en ese vencimiento */
  concepto: string;
  /** Link público de descarga del .ics (debe ser HTTPS en producción) */
  linkCalendario?: string;
}
