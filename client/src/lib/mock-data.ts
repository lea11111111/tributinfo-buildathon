import type {
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

function mockResultFor(input: DiagnosisInput): DiagnosisResult {
  const ventasAnuales = input.ventasMensuales * 12
  const isSimplificado =
    input.actividad === 'comercio' &&
    input.tipoClientes === 'consumidores' &&
    ventasAnuales <= 200000 &&
    input.capital <= 60000

  const isRau = input.actividad === 'agropecuario'

  if (isRau) {
    return {
      regimen: 'RAU',
      justification: {
        text: 'Por actividad agropecuaria y perfil de producción, corresponde el Régimen Agropecuario Unificado.',
        articulo: 'Art. aplicable RAU',
        fuente: 'Normativa RAU / SIN',
        url: 'https://www.impuestos.gob.bo',
      },
      calculo: {
        resumen: 'Cuota unificada estimada según categoría RAU (dato mock).',
        items: [
          { label: 'Cuota RAU', montoBs: 450, periodicidad: 'anual' },
        ],
      },
      calendario: {
        filename: 'calendario-fiscal-2026.ics',
        eventos: [
          {
            titulo: 'Pago RAU',
            fecha: '2026-09-15',
            descripcion: 'Vencimiento estimado (mock)',
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
        { name: 'calcular_impuestos', status: 'done', summary: 'Bs 450 / año' },
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

  return {
    regimen: 'General',
    justification: {
      text: 'Por nivel de ventas, tipo de clientes o actividad, corresponde el Régimen General (IVA, IT e IUE).',
      articulo: 'Ley 843 — impuestos del Régimen General (mock)',
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
