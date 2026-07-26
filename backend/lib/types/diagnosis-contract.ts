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

/** Tipo de servicio de transporte (mapa STI Art. 3–4 / exclusiones). */
export type TipoTransporte =
  | "taxi_vagoneta_minibus"
  | "carga_urbana"
  | "micro_bus_urbano"
  | "interprovincial"
  | "interdepartamental_internacional"
  | "flota_radio_taxi";

/** Ubicación para categoría STI. */
export type UbicacionSti = "capital_lp_cbba_sc" | "otros";

export type ActividadRau = "agricola" | "pecuaria";
export type CertificadoNoImponibilidadRau = "si" | "no_no_se";

export type DiagnosisInput = {
  actividad: Actividad;
  tipoClientes: TipoClientes;
  ventasMensuales: number;
  capital: number;
  /** Requerido (en la UI) si actividad = transporte */
  tipoTransporte?: TipoTransporte;
  ubicacionSti?: UbicacionSti;
  /** Requeridos (en la UI) si actividad = agropecuario. */
  actividadRau?: ActividadRau;
  hectareasRau?: number;
  zonaRau?: string;
  certificadoNoImponibilidadRau?: CertificadoNoImponibilidadRau;
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
    /** montoBs null = dato no disponible (no inventar 0) */
    items: {
      label: string;
      montoBs: number | null;
      periodicidad: string;
      detalle?: string;
      fuente?: string;
      fuenteUrl?: string;
    }[];
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

export type TelegramPayload = {
  telefono: string;
  regimen: string;
  /**
   * Datos del próximo vencimiento. El frontend los manda porque ya los tiene
   * del diagnóstico: así el envío no depende de una caché del servidor, que en
   * Render (plan free) se pierde cada vez que el servicio se duerme o reinicia.
   */
  proximoVencimiento?: string;
  concepto?: string;
  /** Link que va en el mensaje (hoy: "Añadir a Google Calendar" del evento). */
  linkCalendario?: string;
  calendarioFilename?: string;
};
