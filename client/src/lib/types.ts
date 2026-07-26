/** Contrato de datos de la aplicación. */

export type Regimen = 'General' | 'Simplificado' | 'STI' | 'RAU'

export type ToolName =
  | 'buscar_normativa'
  | 'clasificar_regimen'
  | 'calcular_impuestos'
  | 'generar_calendario'
  | 'enviar_recordatorio'

export type ToolStatus = 'waiting' | 'running' | 'done' | 'error'

export type ToolEvent = {
  name: ToolName
  status: ToolStatus
  /** Resultado corto para el panel, ej. "Ley 843, art. 15" */
  summary?: string
}

export type Actividad =
  | 'comercio'
  | 'servicios'
  | 'agropecuario'
  | 'transporte'
  | 'otro'

export type TipoClientes =
  | 'consumidores'
  | 'empresas'
  | 'ambos'

export type TipoTransporte =
  | 'taxi_vagoneta_minibus'
  | 'carga_urbana'
  | 'micro_bus_urbano'
  | 'interprovincial'
  | 'interdepartamental_internacional'
  | 'flota_radio_taxi'

export type UbicacionSti = 'capital_lp_cbba_sc' | 'otros'

export type ActividadRau = 'agricola' | 'pecuaria'
export type CertificadoNoImponibilidadRau = 'si' | 'no_no_se'

export type DiagnosisInput = {
  actividad: Actividad
  tipoClientes: TipoClientes
  ventasMensuales: number
  capital: number
  /** Si actividad = transporte */
  tipoTransporte?: TipoTransporte
  ubicacionSti?: UbicacionSti
  /** Si actividad = agropecuario */
  actividadRau?: ActividadRau
  hectareasRau?: number
  zonaRau?: string
  certificadoNoImponibilidadRau?: CertificadoNoImponibilidadRau
  /** Último dígito del NIT; opcional si aún no tiene */
  ultimoDigitoNit?: number
  telefono?: string
}

export type Justification = {
  text: string
  articulo: string
  fuente: string
  url: string
}

export type CalculoItem = {
  label: string
  /** null = dato no disponible */
  montoBs: number | null
  periodicidad: string
  detalle?: string
  fuente?: string
  fuenteUrl?: string
}

export type Calculo = {
  items: CalculoItem[]
  resumen: string
}

export type CalendarioEvento = {
  titulo: string
  fecha: string
  descripcion?: string
  /** Link opcional para añadir el evento a Google Calendar. */
  googleCalendarUrl?: string
}

export type Calendario = {
  eventos: CalendarioEvento[]
  /** Nombre sugerido del archivo .ics */
  filename: string
}

export type ChecklistPaso = {
  orden: number
  texto: string
  presencial?: boolean
}

export type Checklist = {
  pasos: ChecklistPaso[]
  filename: string
}

export type TelegramStatus = 'idle' | 'sending' | 'sent' | 'error'

export type DiagnosisResult = {
  regimen: Regimen
  justification: Justification
  calculo: Calculo
  calendario: Calendario
  checklist: Checklist
  tools: ToolEvent[]
}

/** Respuesta de POST /api/ask (RAG: pregunta libre sobre normativa) */
export type AskFragmento = {
  fuente: string
  chunkIndex: number
  score: number
  texto: string
  resumen: string
  /** Solo presente en resultados web (fallback Exa) */
  url?: string
}

export type AskResult = {
  pregunta: string
  respuesta: string
  fuentes: string[]
  fragmentos: AskFragmento[]
}

export type ExampleCaseId = 'tienda' | 'freelancer' | 'agricultor'

export type ExampleCase = {
  id: ExampleCaseId
  title: string
  subtitle: string
  input: DiagnosisInput
}

export type AppStep = 'home' | 'interview' | 'working' | 'result'
