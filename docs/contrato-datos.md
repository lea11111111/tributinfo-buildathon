# Contrato de datos — Frontend ↔ Backend

Firmado entre Gabriel (frontend) y Leonardo (tools). No cambiar sin avisar.

## Entrada del diagnóstico

```ts
type DiagnosisInput = {
  actividad: 'comercio' | 'servicios' | 'agropecuario' | 'transporte' | 'otro'
  tipoClientes: 'consumidores' | 'empresas' | 'ambos'
  ventasMensuales: number
  capital: number
  ultimoDigitoNit?: number
  telefono?: string
}
```

## Salida

```ts
type DiagnosisResult = {
  regimen: 'General' | 'Simplificado' | 'STI' | 'RAU'
  justification: {
    text: string
    articulo: string
    fuente: string
    url: string
  }
  calculo: {
    items: { label: string; montoBs: number; periodicidad: string }[]
    resumen: string
  }
  calendario: {
    // googleCalendarUrl: adición opcional retrocompatible (ver nota abajo)
    eventos: { titulo: string; fecha: string; descripcion?: string; googleCalendarUrl?: string }[]
    filename: string // ej. calendario-fiscal-2026.ics
  }
  checklist: {
    pasos: { orden: number; texto: string; presencial?: boolean }[]
    filename: string
  }
  tools: ToolEvent[]
}

type ToolEvent = {
  name:
    | 'buscar_normativa'
    | 'clasificar_regimen'
    | 'calcular_impuestos'
    | 'generar_calendario'
    | 'enviar_recordatorio'
  status: 'waiting' | 'running' | 'done' | 'error'
  summary?: string // ej. "Ley 843, art. 15"
}
```

## Adición opcional: `googleCalendarUrl` (propuesto por Leonardo, pendiente OK de Gabriel)

Cada evento de `calendario.eventos` ahora incluye un campo **opcional**
`googleCalendarUrl?: string` con un link "Añadir a Google Calendar"
(formato `https://calendar.google.com/calendar/render?action=TEMPLATE&...`).

- Es **retrocompatible**: el frontend actual lo ignora sin romperse porque el campo es opcional.
- Si el frontend quiere usarlo: renderizar un botón/link por evento que abra la URL
  en una pestaña nueva; Google Calendar se abre con el evento precargado y el usuario
  solo confirma con "Guardar".
- El .ics descargable (`GET /api/descargar-calendario`) sigue funcionando igual (plan B).

## Endpoints previstos (cuando `VITE_DATA_SOURCE=real`)

- `POST /api/diagnose` → body `DiagnosisInput` → `DiagnosisResult`
- `POST /api/whatsapp` → `{ telefono, regimen, calendarioFilename }` → 200 | error

Fuente tipada en el frontend: `client/src/lib/types.ts`.
