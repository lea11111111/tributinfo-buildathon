import { useState } from 'react'
import type {
  CalendarioEvento,
  DiagnosisResult,
  ToolEvent,
  WhatsAppStatus,
} from '@/lib/types'
import { ToolsPanel } from './ToolsPanel'
import { AskBox } from './AskBox'
import { downloadChecklist, downloadIcs, sendWhatsApp } from '@/lib/api'
import { fechaLegible, googleCalendarUrlDe } from '@/lib/google-calendar'

type Props = {
  result: DiagnosisResult
  onRestart: () => void
}

function toolsWithWhatsApp(
  base: ToolEvent[],
  waStatus: WhatsAppStatus,
): ToolEvent[] {
  const withoutReminder = base.filter((t) => t.name !== 'enviar_recordatorio')
  if (waStatus === 'idle') return withoutReminder

  const reminder: ToolEvent =
    waStatus === 'sending'
      ? {
          name: 'enviar_recordatorio',
          status: 'running',
          summary: 'Enviando por WhatsApp…',
        }
      : waStatus === 'sent'
        ? {
            name: 'enviar_recordatorio',
            status: 'done',
            summary: 'Mensaje enviado',
          }
        : {
            name: 'enviar_recordatorio',
            status: 'error',
            summary: 'Falló el envío',
          }

  return [...withoutReminder, reminder]
}

function formatBs(n: number) {
  return `Bs ${n.toLocaleString('es-BO')}`
}

/** Elige el evento más próximo (fecha >= hoy); si no hay ninguno, cae al primero. */
function proximoVencimiento(eventos: CalendarioEvento[]): {
  fecha: string
  concepto: string
  evento: CalendarioEvento
} {
  const hoy = new Date().toISOString().slice(0, 10)
  const futuros = eventos
    .filter((e) => e.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
  const elegido = futuros[0] ?? eventos[0]

  if (elegido) {
    return {
      fecha: elegido.fecha,
      concepto: elegido.descripcion ?? elegido.titulo,
      evento: elegido,
    }
  }

  // El backend siempre manda al menos un vencimiento; esto solo cubre el tipo.
  const respaldo: CalendarioEvento = {
    fecha: '2026-08-17',
    titulo: 'Vencimiento fiscal',
    descripcion: 'Consultá tu calendario en TributInfo.',
  }
  return { fecha: respaldo.fecha, concepto: respaldo.titulo, evento: respaldo }
}

export function ResultScreen({ result, onRestart }: Props) {
  const [phone, setPhone] = useState('+591')
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>('idle')
  const [waError, setWaError] = useState<string | null>(null)

  const proximo = proximoVencimiento(result.calendario.eventos)

  async function handleWhatsApp() {
    const cleaned = phone.replace(/\s/g, '')
    if (!/^\+591\d{8}$/.test(cleaned)) {
      setWaStatus('error')
      setWaError('Usá formato boliviano: +591 y 8 dígitos.')
      return
    }

    setWaStatus('sending')
    setWaError(null)
    try {
      await sendWhatsApp({
        telefono: cleaned,
        regimen: result.regimen,
        proximoVencimiento: proximo.fecha,
        concepto: proximo.concepto,
        linkCalendario: googleCalendarUrlDe(proximo.evento),
      })
      setWaStatus('sent')
    } catch (err) {
      setWaStatus('error')
      setWaError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar. Usá el botón de Google Calendar.',
      )
    }
  }

  return (
    <section className="screen result-screen">
      <div className="interview-layout">
        <div className="result-panel">
          <header className="result-panel__header">
            <div>
              <p className="eyebrow">Régimen recomendado</p>
              <h1 className="regimen-title">{result.regimen}</h1>
            </div>
            <button type="button" className="btn btn--ghost" onClick={onRestart}>
              Nuevo diagnóstico
            </button>
          </header>

          <div className="result-block">
            <h3>Por qué</h3>
            <p>{result.justification.text}</p>
            <a
              className="cite-link"
              href={result.justification.url}
              target="_blank"
              rel="noreferrer"
            >
              {result.justification.articulo} · {result.justification.fuente}
            </a>
          </div>

          <div className="result-block">
            <h3>Cuánto pagarías</h3>
            <p className="muted">{result.calculo.resumen}</p>
            <ul className="calc-list">
              {result.calculo.items.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>
                    {formatBs(item.montoBs)}
                    <em> / {item.periodicidad}</em>
                  </strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="delivery-zone">
            <h3>Recibilo ahora</h3>
            <p className="muted">
              Guardá los vencimientos en tu Google Calendar y recibilos por WhatsApp.
            </p>

            <div className="wa-row">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+59170000000"
                aria-label="Número de WhatsApp"
                disabled={waStatus === 'sending'}
              />
              <button
                type="button"
                className="btn btn--whatsapp"
                onClick={handleWhatsApp}
                disabled={waStatus === 'sending' || waStatus === 'sent'}
              >
                {waStatus === 'sending' && 'Enviando…'}
                {waStatus === 'sent' && 'Enviado ✓'}
                {(waStatus === 'idle' || waStatus === 'error') &&
                  'Enviármelo por WhatsApp'}
              </button>
            </div>

            {waStatus === 'sent' && (
              <p className="wa-status wa-status--ok" role="status">
                Calendario enviado. Revisá WhatsApp en el celular.
              </p>
            )}
            {waStatus === 'error' && waError && (
              <p className="wa-status wa-status--err" role="alert">
                {waError}
              </p>
            )}

            <a
              className="btn btn--gcal btn--block"
              href={googleCalendarUrlDe(proximo.evento)}
              target="_blank"
              rel="noreferrer"
            >
              Añadir a Google Calendar
            </a>
            <p className="gcal-hint">
              Se abre Google Calendar con el vencimiento del{' '}
              {fechaLegible(proximo.fecha)} listo para guardar. Si no tenés sesión
              iniciada, Google te la pide primero.
            </p>

            {result.calendario.eventos.length > 1 && (
              <details className="gcal-more">
                <summary>
                  Ver los {result.calendario.eventos.length} vencimientos del año
                </summary>
                <ul className="gcal-list">
                  {result.calendario.eventos.map((evento) => (
                    <li key={`${evento.fecha}-${evento.titulo}`}>
                      <span>{fechaLegible(evento.fecha)}</span>
                      <a
                        href={googleCalendarUrlDe(evento)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Añadir
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="download-row">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() =>
                  downloadChecklist(result.checklist.filename, result.checklist.pasos)
                }
              >
                Checklist del NIT
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() =>
                  downloadIcs(result.calendario.filename, result.calendario.eventos)
                }
                title="Archivo .ics para Outlook, Apple Calendar u otros"
              >
                Archivo .ics (respaldo)
              </button>
            </div>
          </div>

          <AskBox />
        </div>

        <ToolsPanel tools={toolsWithWhatsApp(result.tools, waStatus)} />
      </div>
    </section>
  )
}
