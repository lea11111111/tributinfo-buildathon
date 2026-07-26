/**
 * CONTRATO DE DATOS backend <-> frontend.
 *
 * Regla de equipo: este archivo NO se cambia sin avisar a Gabriel.
 * Es la forma exacta del objeto que el backend le manda al frontend.
 */

export type NombreRegimen = "General" | "Simplificado" | "STI" | "RAU";

export type EstadoTool = "idle" | "running" | "done" | "error";

/** Referencia a la norma que respalda una afirmación. Nunca se omite. */
export interface Fuente {
  norma: string; // p. ej. "Ley 843 (Texto Ordenado)"
  articulo: string; // p. ej. "Art. 15"
  link: string; // URL al documento oficial
}

export interface RegimenResultado {
  nombre: NombreRegimen;
  /** Categoría dentro del Simplificado (1..N), si aplica */
  categoria?: number;
  /** Categoría STI ("B" | "1" | "2"), si aplica */
  categoriaSti?: "B" | "1" | "2";
  /** Explicación en lenguaje simple de por qué le corresponde */
  justificacion: string;
  fuente: Fuente;
  /** Avisos: datos no verificados, caso borde, etc. */
  advertencias: string[];
}

export interface LineaImpuesto {
  impuesto: string; // "IVA", "IT", "IUE", "Cuota bimestral"
  sigla: string;
  /** null = dato no disponible (nunca inventar 0 como cuota) */
  monto: number | null; // en Bs
  periodicidad: "mensual" | "bimestral" | "trimestral" | "anual";
  detalle: string; // cómo se calculó, p. ej. "13% sobre Bs 8.000"
  fuente: Fuente;
}

export interface CalculoResultado {
  lineas: LineaImpuesto[];
  /** null si no hay datos para estimar (p. ej. RAU sin planilla) */
  totalMensualEstimado: number | null; // en Bs, normalizado a mes
  advertencias: string[];
}

export interface EventoFiscal {
  fecha: string; // ISO 8601, p. ej. "2026-08-15"
  titulo: string; // "Vencimiento IVA - NIT terminado en 4"
  descripcion: string;
  impuesto: string;
  fuente: Fuente;
  /**
   * Link "Añadir a Google Calendar" (adición opcional retrocompatible,
   * propuesta por Leonardo — pendiente OK de Gabriel).
   */
  googleCalendarUrl?: string;
}

export interface CalendarioResultado {
  eventos: EventoFiscal[];
  /** Contenido del .ics listo para descargar */
  icsContent: string;
  nombreArchivo: string; // "calendario-fiscal-2026.ics"
  advertencias: string[];
}

export interface PasoChecklist {
  paso: number;
  titulo: string;
  descripcion: string;
  documentosRequeridos: string[];
  fuente: Fuente;
}

export interface EnvioResultado {
  exito: boolean;
  /** Estado que reporta Zavu: queued | sent | delivered | read | failed */
  estado?: string;
  idMensaje?: string;
  /** Si exito=false: mensaje legible para mostrar en la UI */
  error?: string;
}

/** Objeto completo que consume la pantalla de Resultado */
export interface ResultadoTributario {
  regimen: RegimenResultado;
  calculo?: CalculoResultado;
  calendario: CalendarioResultado;
  checklist?: PasoChecklist[];
  tools: {
    clasificar_regimen: EstadoTool;
    calcular_impuestos: EstadoTool;
    generar_calendario: EstadoTool;
    enviar_recordatorio: EstadoTool;
  };
}
