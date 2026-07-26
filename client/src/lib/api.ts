import type { AskResult, DiagnosisInput, DiagnosisResult, ToolEvent } from './types'
import { isMock, API_URL } from './config'
import { animateToolSequence, runMockAsk, runMockDiagnosis } from './mock-data'

export async function diagnose(
  input: DiagnosisInput,
  onTools: (tools: ToolEvent[]) => void,
): Promise<DiagnosisResult> {
  if (isMock) {
    return runMockDiagnosis(input, onTools)
  }

  const res = await fetch(`${API_URL}/api/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error('El diagnóstico falló. Probá de nuevo.')
  }

  const result = (await res.json()) as DiagnosisResult
  // enviar_recordatorio no corre en el diagnose; se usa al mandar por Telegram.
  const finalTools = (Array.isArray(result.tools) ? result.tools : []).filter(
    (t) => t.name !== 'enviar_recordatorio',
  )

  // La respuesta llega completa; animamos el panel para la demo.
  await animateToolSequence(finalTools, onTools)

  return { ...result, tools: finalTools }
}

/** Pregunta libre sobre normativa (RAG + LLM). */
export async function ask(pregunta: string): Promise<AskResult> {
  if (isMock) {
    return runMockAsk(pregunta)
  }

  const res = await fetch(`${API_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pregunta }),
  })

  const data = (await res.json().catch(() => null)) as
    | (AskResult & { error?: string })
    | null

  if (!res.ok || !data?.respuesta) {
    throw new Error(data?.error ?? 'La consulta falló. Probá de nuevo.')
  }

  return data
}

type TelegramPayload = {
  regimen: string
  proximoVencimiento: string
  concepto: string
  linkCalendario?: string
}

type TelegramConnectionStatus = {
  status: 'pending' | 'sent' | 'error' | 'expired'
  error?: string
}

export async function connectTelegram(payload: TelegramPayload): Promise<{
  token: string
  telegramUrl?: string
}> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 400))
    return { token: 'mock' }
  }

  const res = await fetch(`${API_URL}/api/telegram/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await res.json().catch(() => null)) as
    | { token?: string; telegramUrl?: string; error?: string }
    | null

  if (!res.ok || !data?.token || !data.telegramUrl) {
    throw new Error(data?.error ?? 'No se pudo abrir Telegram.')
  }

  return { token: data.token, telegramUrl: data.telegramUrl }
}

export async function waitForTelegramConnection(
  token: string,
): Promise<void> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 1000))
    return
  }

  const deadline = Date.now() + 2 * 60 * 1000
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500))
    const res = await fetch(
      `${API_URL}/api/telegram/connect?token=${encodeURIComponent(token)}`,
    )
    const data = (await res.json().catch(() => null)) as
      | TelegramConnectionStatus
      | null

    if (data?.status === 'sent') return
    if (!res.ok || data?.status === 'error' || data?.status === 'expired') {
      throw new Error(
        data?.error ?? 'No se pudo completar el envío por Telegram.',
      )
    }
  }

  throw new Error('No recibimos la confirmación de Telegram. Intentá de nuevo.')
}

/** Genera un .ics mínimo descargable (mock / plan B). */
export function downloadIcs(
  filename: string,
  eventos: { titulo: string; fecha: string; descripcion?: string }[],
) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TributInfo//ES',
    'CALSCALE:GREGORIAN',
  ]

  for (const ev of eventos) {
    const day = ev.fecha.replace(/-/g, '')
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${day}`,
      `SUMMARY:${escapeIcs(ev.titulo)}`,
      ev.descripcion ? `DESCRIPTION:${escapeIcs(ev.descripcion)}` : '',
      `UID:${day}-${Math.random().toString(36).slice(2)}@tributinfo`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.filter(Boolean).join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  })
  triggerDownload(blob, filename)
}

export function downloadChecklist(
  filename: string,
  pasos: { orden: number; texto: string }[],
) {
  const text = [
    'Checklist de inscripción al NIT — TributInfo',
    'Orientación informativa. No constituye asesoría fiscal.',
    '',
    ...pasos.map((p) => `${p.orden}. ${p.texto}`),
    '',
  ].join('\n')

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const name = filename.endsWith('.pdf')
    ? filename.replace(/\.pdf$/, '.txt')
    : filename
  triggerDownload(blob, name)
}

function escapeIcs(value: string) {
  return value.replace(/[\\;,\n]/g, (c) => `\\${c}`)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
