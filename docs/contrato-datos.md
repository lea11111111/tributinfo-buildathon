# Contrato de datos — Frontend ↔ Backend

Contrato entre Gabriel (frontend) y Leonardo (tools). No cambiar sin avisar.

Fuente tipada: `client/src/lib/types.ts` y `backend/lib/types/diagnosis-contract.ts`.

## Entrada del diagnóstico

```ts
type DiagnosisInput = {
  actividad: 'comercio' | 'servicios' | 'agropecuario' | 'transporte' | 'otro'
  tipoClientes: 'consumidores' | 'empresas' | 'ambos'
  ventasMensuales: number
  capital: number
  /** Si actividad = transporte: tipo de servicio y ubicación para categoría STI */
  tipoTransporte?:
    | 'taxi_vagoneta_minibus'
    | 'carga_urbana'
    | 'micro_bus_urbano'
    | 'interprovincial'
    | 'interdepartamental_internacional'
    | 'flota_radio_taxi'
  ubicacionSti?: 'capital_lp_cbba_sc' | 'otros'
  /** Si actividad = agropecuario: datos para cuota y límites RAU */
  actividadRau?: 'agricola' | 'pecuaria'
  hectareasRau?: number
  zonaRau?: string
  certificadoNoImponibilidadRau?: 'si' | 'no_no_se'
  ultimoDigitoNit?: number
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
    /** montoBs null = dato no disponible (nunca mostrar Bs 0 inventado) */
    items: {
      label: string
      montoBs: number | null
      periodicidad: string
      detalle?: string
      fuente?: string
      fuenteUrl?: string
    }[]
    resumen: string
  }
  calendario: {
    eventos: {
      titulo: string
      fecha: string
      descripcion?: string
      /** Link "Añadir a Google Calendar" (TEMPLATE) */
      googleCalendarUrl?: string
    }[]
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

## Google Calendar

Cada evento puede incluir `googleCalendarUrl` con un link
`https://calendar.google.com/calendar/render?action=TEMPLATE&...`.
El frontend abre ese link; el usuario confirma “Guardar” en Google.
El `.ics` (`GET /api/descargar-calendario` o descarga en cliente) sigue como respaldo.

## Endpoints (`VITE_DATA_SOURCE=real`)

| Método | Ruta | Body / query | Respuesta |
|---|---|---|---|
| `POST` | `/api/diagnose` | `DiagnosisInput` | `DiagnosisResult` |
| `POST` | `/api/ask` | `{ pregunta, topK? }` | `{ pregunta, respuesta, fuentes, fragmentos }` |
| `POST` | `/api/buscar-normativa` | `{ consulta, limite? }` | Fragmentos del corpus (+ Exa si hay key) |
| `POST` | `/api/telegram/connect` | `{ regimen, proximoVencimiento, concepto, linkCalendario? }` | `{ token, telegramUrl }` |
| `GET` | `/api/telegram/connect?token=` | — | `{ status: pending \| sent \| error \| expired }` |
| `POST` | `/api/telegram` | `{ chatId o telefono, regimen, … }` | `{ exito, … }` |
| `POST` | `/api/zavu/webhook` | Evento Zavu | Ack `{ ok: true }` |
| `GET` | `/api/descargar-calendario` | `regimen`, `digito`, `anio?` | Archivo `.ics` |
| `GET` | `/health` | — | Estado de config (sin secretos) |

`enviar_recordatorio` no corre dentro de `/api/diagnose`: se dispara al conectar Telegram (o al enviar con chatId).
