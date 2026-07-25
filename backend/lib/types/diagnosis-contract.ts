/**
 * Tipos del contrato firmado con Gabriel — espejo de client/src/lib/types.ts
 * y docs/contrato-datos.md. No cambiar sin avisar.
 */

export type Regimen = "General" | "Simplificado" | "STI" | "RAU";

export type ToolName =
  | "buscar_normativa"
  | "clasificar_regimen"
  | "calcular_impuestos"
  | "generar_calendario"
  | "enviar_recordatorio";

export type ToolStatus = "waiting" | "running" | "done" | "error";

export type ToolEvent = {
  name: ToolName;
  status: ToolStatus;
  summary?: string;
};

export type Actividad = "comercio" | "servicios" | "agropecuario" | "transporte" | "otro";

export type TipoClientes = "consumidores" | "empresas" | "ambos";

export type DiagnosisInput = {
  actividad: Actividad;
  tipoClientes: TipoClientes;
  ventasMensuales: number;
  capital: number;
  ultimoDigitoNit?: number;
  telefono?: string;
};

export type DiagnosisResult = {
  regimen: Regimen;
  justification: {
    text: string;
    articulo: string;
    fuente: string;
    url: string;
  };
  calculo: {
    items: { label: string; montoBs: number; periodicidad: string }[];
    resumen: string;
  };
  calendario: {
    eventos: {
      titulo: string;
      fecha: string;
      descripcion?: string;
      /**
       * Link "Añadir a Google Calendar" (adición opcional retrocompatible,
       * propuesta por Leonardo — pendiente OK de Gabriel).
       */
      googleCalendarUrl?: string;
    }[];
    filename: string;
  };
  checklist: {
    pasos: { orden: number; texto: string; presencial?: boolean }[];
    filename: string;
  };
  tools: ToolEvent[];
};

export type WhatsAppPayload = {
  telefono: string;
  regimen: string;
  calendarioFilename: string;
};
