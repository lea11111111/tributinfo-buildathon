import type {
  ActividadRau,
  AskResult,
  DiagnosisInput,
  DiagnosisResult,
  ExampleCase,
  ToolEvent,
} from './types'

export const EXAMPLE_CASES: ExampleCase[] = [
  {
    id: 'tienda',
    title: 'Tienda de barrio',
    subtitle: 'Vende al por menor, capital bajo',
    input: {
      actividad: 'comercio',
      tipoClientes: 'consumidores',
      ventasMensuales: 8000,
      capital: 25000,
      ultimoDigitoNit: 4,
    },
  },
  {
    id: 'freelancer',
    title: 'Freelancer',
    subtitle: 'Servicios a empresas, factura',
    input: {
      actividad: 'servicios',
      tipoClientes: 'empresas',
      ventasMensuales: 12000,
      capital: 5000,
      ultimoDigitoNit: 7,
    },
  },
  {
    id: 'agricultor',
    title: 'Productor agrícola',
    subtitle: 'Cultivo y venta de productos',
    input: {
      actividad: 'agropecuario',
      tipoClientes: 'ambos',
      ventasMensuales: 15000,
      capital: 80000,
      actividadRau: 'agricola',
      hectareasRau: 20,
      zonaRau: 'valles-abiertos-riego',
      certificadoNoImponibilidadRau: 'no_no_se',
      ultimoDigitoNit: 2,
    },
  },
]

export const TOOL_LABELS: Record<ToolEvent['name'], string> = {
  buscar_normativa: 'buscar_normativa',
  clasificar_regimen: 'clasificar_regimen',
  calcular_impuestos: 'calcular_impuestos',
  generar_calendario: 'generar_calendario',
  enviar_recordatorio: 'enviar_recordatorio',
}

const INITIAL_TOOLS: ToolEvent[] = [
  { name: 'buscar_normativa', status: 'waiting' },
  { name: 'clasificar_regimen', status: 'waiting' },
  { name: 'calcular_impuestos', status: 'waiting' },
  { name: 'generar_calendario', status: 'waiting' },
]

type RauZonaOption = {
  value: string
  label: string
  actividades: ActividadRau[]
  cuotaAgricola: number
  cuotaPecuaria?: number
}

const AMBAS_ACTIVIDADES: ActividadRau[] = ['agricola', 'pecuaria']

export const RAU_ZONA_OPTIONS: RauZonaOption[] = [
  { value: 'altiplano-norte-riberena-titicaca', label: 'Altiplano Norte — Ribereña al Lago Titicaca', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 49.06, cuotaPecuaria: 3.03 },
  { value: 'altiplano-norte-influencia-titicaca', label: 'Altiplano Norte — Con influencia del Lago Titicaca', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 44.34, cuotaPecuaria: 3.03 },
  { value: 'altiplano-norte-sin-influencia-titicaca', label: 'Altiplano Norte — Sin influencia del Lago Titicaca', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 34.77, cuotaPecuaria: 3.03 },
  { value: 'altiplano-central-influencia-poopo', label: 'Altiplano Central — Con influencia del Lago Poopó', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 36.72, cuotaPecuaria: 3.15 },
  { value: 'altiplano-central-sin-influencia-poopo', label: 'Altiplano Central — Sin influencia del Lago Poopó', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 28.51, cuotaPecuaria: 1.62 },
  { value: 'altiplano-sur-semidesertica', label: 'Altiplano Sur — Sur y semidesértica', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 15.87, cuotaPecuaria: 1.78 },
  { value: 'altiplano-sur-andina', label: 'Altiplano Sur — Andina, altiplano y puna', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 15.87, cuotaPecuaria: 1.78 },
  { value: 'valles-cochabamba-riego', label: 'Valles de Cochabamba — Riego', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 136.96, cuotaPecuaria: 6.17 },
  { value: 'valles-cochabamba-secano', label: 'Valles de Cochabamba — Secano', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 45.54, cuotaPecuaria: 1.57 },
  { value: 'valles-cochabamba-viticola', label: 'Valles de Cochabamba — Vinícola', actividades: ['agricola'], cuotaAgricola: 155.07 },
  { value: 'valles-abiertos-riego', label: 'Otros valles abiertos — Riego', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 136.96, cuotaPecuaria: 6.17 },
  { value: 'valles-abiertos-secano', label: 'Otros valles abiertos — Secano', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 45.54, cuotaPecuaria: 1.57 },
  { value: 'valles-abiertos-viticola', label: 'Otros valles abiertos — Vinícola', actividades: ['agricola'], cuotaAgricola: 155.07 },
  { value: 'valles-cerrados-serranias', label: 'Valles cerrados — Valles y serranías', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 65.93, cuotaPecuaria: 2.9 },
  { value: 'valles-cerrados-riego', label: 'Otros valles cerrados — Riego', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 142.64, cuotaPecuaria: 5.84 },
  { value: 'valles-cerrados-secano', label: 'Otros valles cerrados — Secano', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 65.93, cuotaPecuaria: 2.9 },
  { value: 'valles-cerrados-viticola', label: 'Otros valles cerrados — Vinícola', actividades: ['agricola'], cuotaAgricola: 155.07 },
  { value: 'cabecera-valle-secano', label: 'Cabecera de valle — Secano', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 21.8, cuotaPecuaria: 1.7 },
  { value: 'subtropical-yungas', label: 'Subtropical — Yungas', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 57.44, cuotaPecuaria: 3.03 },
  { value: 'subtropical-santa-cruz', label: 'Subtropical — Santa Cruz', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 35.51, cuotaPecuaria: 2.61 },
  { value: 'subtropical-chaco', label: 'Subtropical — Chaco', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 3.69, cuotaPecuaria: 1.37 },
  { value: 'tropical-beni-pando-iturralde', label: 'Tropical — Beni, Pando e Iturralde', actividades: AMBAS_ACTIVIDADES, cuotaAgricola: 32.57, cuotaPecuaria: 2.61 },
]

function mockResultFor(input: DiagnosisInput): DiagnosisResult {
  const ventasAnuales = input.ventasMensuales * 12
  const isSimplificado =
    input.actividad === 'comercio' &&
    input.tipoClientes === 'consumidores' &&
    ventasAnuales <= 200000 &&
    input.capital <= 60000

  const isRau = input.actividad === 'agropecuario'
  const isStiExcluido =
    input.actividad === 'transporte' &&
    (input.tipoTransporte === 'interdepartamental_internacional' ||
      input.tipoTransporte === 'flota_radio_taxi')
  const isSti = input.actividad === 'transporte' && !isStiExcluido

  if (isRau) {
    const zona = RAU_ZONA_OPTIONS.find((option) => option.value === input.zonaRau)
    const cuotaPorHectarea =
      input.actividadRau === 'agricola'
        ? zona?.cuotaAgricola
        : input.actividadRau === 'pecuaria'
          ? zona?.cuotaPecuaria
          : undefined
    const montoRau =
      input.certificadoNoImponibilidadRau === 'si' ||
      cuotaPorHectarea == null ||
      input.hectareasRau == null
        ? null
        : Math.round(input.hectareasRau * cuotaPorHectarea * 100) / 100
    const detalleRau =
      montoRau != null
        ? `${input.hectareasRau} ha × Bs ${cuotaPorHectarea?.toFixed(2)} por ha en ${zona?.label}.`
        : input.certificadoNoImponibilidadRau === 'si'
          ? 'Indicás que contás con Certificado de No Imponibilidad; verificá que esté vigente.'
          : 'Completá actividad, hectáreas y zona para calcular la cuota.'

    return {
      regimen: 'RAU',
      justification: {
        text: 'Por tu actividad agropecuaria y la superficie declarada, tu perfil puede corresponder al Régimen Agropecuario Unificado.',
        articulo: 'Arts. 2, 8, 10, 13 y 15',
        fuente: 'D.S. Nº 24463',
        url: 'https://sac.impuestos.gob.bo/formularios/pdf/1.-LEY%20N%C2%B0%20843-02-26.pdf',
      },
      calculo: {
        resumen:
          montoRau != null
            ? `Cuota anual estimada: Bs ${montoRau}. Tabla RAU gestión 2024.`
            : detalleRau,
        items: [
          {
            label: 'Cuota anual RAU',
            montoBs: montoRau,
            periodicidad: 'anual',
            detalle: detalleRau,
            fuente: 'RND Nº 102500000038, Artículo Único',
            fuenteUrl:
              'https://www.impuestos.gob.bo/wp-content/uploads/2025/10/RND-102500000038.pdf',
          },
        ],
      },
      calendario: {
        filename: 'calendario-fiscal-2026.ics',
        eventos: [
          {
            titulo: 'Pago RAU',
            fecha: '2026-10-31',
            descripcion: 'Vencimiento general anual del RAU; verificá posibles prórrogas.',
          },
        ],
      },
      checklist: {
        filename: 'checklist-nit.pdf',
        pasos: [
          { orden: 1, texto: 'Reunir documentos de identidad y domicilio', presencial: false },
          { orden: 2, texto: 'Constancia de actividad agropecuaria', presencial: false },
          { orden: 3, texto: 'Inscripción en oficina del SIN o línea', presencial: true },
        ],
      },
      tools: [
        { name: 'buscar_normativa', status: 'done', summary: 'Normativa RAU' },
        { name: 'clasificar_regimen', status: 'done', summary: 'RAU' },
        {
          name: 'calcular_impuestos',
          status: 'done',
          summary: montoRau != null ? `Bs ${montoRau} / año est.` : 'dato no disponible',
        },
        { name: 'generar_calendario', status: 'done', summary: '1 vencimiento' },
      ],
    }
  }

  if (isSimplificado) {
    return {
      regimen: 'Simplificado',
      justification: {
        text: 'Con capital y ventas anuales dentro de los topes, y venta a consumidores finales, corresponde el Régimen Tributario Simplificado.',
        articulo: 'Ley 843, art. 15 (mock)',
        fuente: 'Ley 843 (Texto Ordenado) + RND categorías RTS',
        url: 'https://www.impuestos.gob.bo',
      },
      calculo: {
        resumen: 'Cuota fija bimestral según categoría (dato mock de planilla).',
        items: [
          { label: 'Cuota RTS (categoría estimada)', montoBs: 300, periodicidad: 'bimestral' },
        ],
      },
      calendario: {
        filename: 'calendario-fiscal-2026.ics',
        eventos: [
          {
            titulo: 'Pago cuota Simplificado',
            fecha: '2026-03-13',
            descripcion: `Vencimiento NIT dígito ${input.ultimoDigitoNit ?? 0} (mock)`,
          },
          {
            titulo: 'Pago cuota Simplificado',
            fecha: '2026-05-13',
          },
          {
            titulo: 'Pago cuota Simplificado',
            fecha: '2026-07-13',
          },
        ],
      },
      checklist: {
        filename: 'checklist-nit.pdf',
        pasos: [
          { orden: 1, texto: 'Cédula de identidad vigente', presencial: false },
          { orden: 2, texto: 'Factura de luz o agua a tu nombre', presencial: false },
          { orden: 3, texto: 'Croquis del domicilio / negocio', presencial: false },
          { orden: 4, texto: 'Inscripción NIT en el SIN', presencial: true },
        ],
      },
      tools: [
        { name: 'buscar_normativa', status: 'done', summary: 'Ley 843, art. 15' },
        { name: 'clasificar_regimen', status: 'done', summary: 'Simplificado' },
        { name: 'calcular_impuestos', status: 'done', summary: 'Bs 300 / bimestre' },
        { name: 'generar_calendario', status: 'done', summary: '3 vencimientos' },
      ],
    }
  }

  if (isSti) {
    const cuotaPorTipoUbicacion: Record<string, number> = {
      'taxi_vagoneta_minibus:capital_lp_cbba_sc': 150,
      'taxi_vagoneta_minibus:otros': 100,
      'carga_urbana:capital_lp_cbba_sc': 150,
      'carga_urbana:otros': 100,
      'micro_bus_urbano:capital_lp_cbba_sc': 275,
      'micro_bus_urbano:otros': 150,
      'interprovincial:capital_lp_cbba_sc': 275,
      'interprovincial:otros': 150,
    }
    const key =
      input.tipoTransporte && input.ubicacionSti
        ? `${input.tipoTransporte}:${input.ubicacionSti}`
        : ''
    const cuota = key ? cuotaPorTipoUbicacion[key] : undefined

    return {
      regimen: 'STI',
      justification: {
        text: cuota
          ? `Tu actividad es el transporte público, por lo que te corresponde el Sistema Tributario Integrado (STI) con cuota trimestral de Bs ${cuota} (mock D.S. 23027).`
          : 'Tu actividad es el transporte, por lo que te corresponde el Sistema Tributario Integrado (STI). La cuota exacta depende del tipo de vehículo y la ubicación.',
        articulo: 'D.S. N° 23027 Art. 3–4',
        fuente: 'Ley 843 (Texto Ordenado) — STI',
        url: 'https://sac.impuestos.gob.bo/formularios/pdf/LEY%20843-09-22.pdf',
      },
      calculo: {
        resumen: cuota
          ? `Cuota trimestral STI Bs ${cuota}. Confirmá vigencia en el SIN (Art. 10).`
          : 'Cuota STI entre Bs 100 y Bs 275 trimestrales según categoría. Indicá tipo de vehículo y ubicación para fijar el monto.',
        items: [
          {
            label: 'Cuota del régimen STI',
            montoBs: cuota ?? null,
            periodicidad: 'trimestral',
          },
        ],
      },
      calendario: {
        filename: 'calendario-fiscal-2026.ics',
        eventos: [
          { titulo: 'Pago trimestral STI', fecha: '2026-04-22' },
          { titulo: 'Pago trimestral STI', fecha: '2026-07-22' },
          { titulo: 'Pago trimestral STI', fecha: '2026-10-22' },
          { titulo: 'Pago trimestral STI', fecha: '2027-01-22' },
        ],
      },
      checklist: {
        filename: 'checklist-nit.pdf',
        pasos: [
          { orden: 1, texto: 'Cédula de identidad vigente', presencial: false },
          { orden: 2, texto: 'Documentación del vehículo / actividad de transporte', presencial: false },
          { orden: 3, texto: 'Inscripción NIT en el SIN (formulario STI)', presencial: true },
        ],
      },
      tools: [
        { name: 'buscar_normativa', status: 'done', summary: 'D.S. 23027 Art. 3–4' },
        { name: 'clasificar_regimen', status: 'done', summary: 'STI' },
        {
          name: 'calcular_impuestos',
          status: 'done',
          summary: cuota ? `Bs ${cuota} / trim.` : 'dato no disponible',
        },
        { name: 'generar_calendario', status: 'done', summary: '4 vencimientos' },
      ],
    }
  }

  return {
    regimen: 'General',
    justification: {
      text: isStiExcluido
        ? 'Tu actividad es transporte, pero está excluida del STI (interdepartamental/internacional o flota/radio taxi), por lo que te corresponde el Régimen General.'
        : 'Por nivel de ventas, tipo de clientes o actividad, corresponde el Régimen General (IVA, IT e IUE).',
      articulo: isStiExcluido
        ? 'D.S. N° 28522 — exclusión STI'
        : 'Ley 843 — impuestos del Régimen General (mock)',
      fuente: 'Ley 843 (Texto Ordenado)',
      url: 'https://www.impuestos.gob.bo',
    },
    calculo: {
      resumen: 'Estimación mensual sobre ventas declaradas (mock).',
      items: [
        {
          label: 'IVA (13%)',
          montoBs: Math.round(input.ventasMensuales * 0.13),
          periodicidad: 'mensual',
        },
        {
          label: 'IT (3%)',
          montoBs: Math.round(input.ventasMensuales * 0.03),
          periodicidad: 'mensual',
        },
        {
          label: 'IUE (aprox. mensualizado)',
          montoBs: Math.round(input.ventasMensuales * 0.05),
          periodicidad: 'anual / anticipos',
        },
      ],
    },
    calendario: {
      filename: 'calendario-fiscal-2026.ics',
      eventos: [
        {
          titulo: 'Declaración IVA / IT',
          fecha: '2026-04-15',
          descripcion: `Vencimiento NIT dígito ${input.ultimoDigitoNit ?? 0} (mock)`,
        },
      ],
    },
    checklist: {
      filename: 'checklist-nit.pdf',
      pasos: [
        { orden: 1, texto: 'Documentos de identidad y domicilio', presencial: false },
        { orden: 2, texto: 'Alta en facturación (incluida electrónica)', presencial: false },
        { orden: 3, texto: 'Inscripción NIT Régimen General', presencial: true },
      ],
    },
    tools: [
      { name: 'buscar_normativa', status: 'done', summary: 'Ley 843 — General' },
      { name: 'clasificar_regimen', status: 'done', summary: 'General' },
      { name: 'calcular_impuestos', status: 'done', summary: 'IVA + IT + IUE' },
      { name: 'generar_calendario', status: 'done', summary: '1 vencimiento' },
    ],
  }
}

export function createInitialTools(): ToolEvent[] {
  return INITIAL_TOOLS.map((t) => ({ ...t }))
}

const TOOL_ANIMATION_DELAYS_MS = [700, 900, 800, 700, 600]

/**
 * Reproduce el “teatro” del agente: waiting → running → estado final,
 * una tool tras otra. Sirve para datos simulados y en vivo.
 */
export async function animateToolSequence(
  finalTools: ToolEvent[],
  onTools: (tools: ToolEvent[]) => void,
): Promise<void> {
  const tools: ToolEvent[] = finalTools.map((t) => ({
    name: t.name,
    status: 'waiting',
  }))
  onTools([...tools])

  for (let i = 0; i < finalTools.length; i++) {
    const final = finalTools[i]
    // Las tools que quedan en waiting (ej. enviar_recordatorio) no se “ejecutan”.
    if (final.status === 'waiting') {
      tools[i] = { ...final }
      onTools([...tools])
      continue
    }

    tools[i] = { ...tools[i], status: 'running', summary: 'Ejecutando...' }
    onTools([...tools])
    await wait(TOOL_ANIMATION_DELAYS_MS[i] ?? 700)
    tools[i] = { ...final }
    onTools([...tools])
  }
}

/** Simula el agente ejecutando tools con retardo escalonado. */
export async function runMockDiagnosis(
  input: DiagnosisInput,
  onTools: (tools: ToolEvent[]) => void,
): Promise<DiagnosisResult> {
  const final = mockResultFor(input)
  await animateToolSequence(final.tools, onTools)
  return { ...final, tools: [...final.tools] }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Simula una consulta libre al RAG (/api/ask). */
export async function runMockAsk(pregunta: string): Promise<AskResult> {
  await wait(1200)
  return {
    pregunta,
    respuesta:
      'Según la Ley 843, el Régimen Tributario Simplificado agrupa a comerciantes minoristas, artesanos y vivanderos cuyo capital y ventas anuales están dentro de los topes vigentes. La cuota se paga por bimestre según la categoría. (Respuesta de demostración.)',
    fuentes: ['02-ley-843-impuestos.md'],
    fragmentos: [
      {
        fuente: '02-ley-843-impuestos.md',
        chunkIndex: 371,
        score: 0.21,
        texto: 'El impuesto así determinado deberá empozarse considerando el último dígito del número del NIT…',
        resumen: '02-ley-843-impuestos.md (chunk 371)',
      },
    ],
  }
}

export const ACTIVIDAD_OPTIONS: { value: DiagnosisInput['actividad']; label: string }[] = [
  { value: 'comercio', label: 'Comercio / tienda' },
  { value: 'servicios', label: 'Servicios / freelance' },
  { value: 'agropecuario', label: 'Agropecuario' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'otro', label: 'Otro' },
]

export const CLIENTES_OPTIONS: { value: DiagnosisInput['tipoClientes']; label: string }[] = [
  { value: 'consumidores', label: 'Consumidores finales' },
  { value: 'empresas', label: 'Empresas que piden factura' },
  { value: 'ambos', label: 'A los dos' },
]

export const TIPO_TRANSPORTE_OPTIONS: {
  value: NonNullable<DiagnosisInput['tipoTransporte']>
  label: string
}[] = [
  { value: 'taxi_vagoneta_minibus', label: 'Taxi, vagoneta o minibus' },
  { value: 'carga_urbana', label: 'Carga urbana / material de construcción' },
  { value: 'micro_bus_urbano', label: 'Micro o bus urbano' },
  { value: 'interprovincial', label: 'Interprovincial (pasajeros o carga)' },
  { value: 'interdepartamental_internacional', label: 'Interdepartamental o internacional' },
  { value: 'flota_radio_taxi', label: 'Flota o radio taxi' },
]

export const UBICACION_STI_OPTIONS: {
  value: NonNullable<DiagnosisInput['ubicacionSti']>
  label: string
}[] = [
  { value: 'capital_lp_cbba_sc', label: 'Capital: La Paz, Cochabamba o Santa Cruz' },
  { value: 'otros', label: 'El Alto, provincias u otro departamento' },
]
