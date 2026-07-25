import type { DiagnosisInput, DiagnosisResult, ToolEvent } from './types'
import { isMock, API_URL } from './config'
import { runMockDiagnosis } from './mock-data'

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

  return res.json() as Promise<DiagnosisResult>
}

export async function sendWhatsApp(payload: {
  telefono: string
  regimen: string
  calendarioFilename: string
}): Promise<void> {
  if (isMock) {
    await new Promise((r) => setTimeout(r, 1400))
    if (!/^\+591\d{8}$/.test(payload.telefono.replace(/\s/g, ''))) {
      // Accept common formats in mock; still validate loosely
    }
    return
  }

  const res = await fetch(`${API_URL}/api/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('No se pudo enviar por WhatsApp.')
  }
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
