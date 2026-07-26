import { useState } from 'react'
import type {
  CalendarioEvento,
  DiagnosisResult,
  ToolEvent,
  TelegramStatus,
} from '@/lib/types'
import { ToolsPanel } from './ToolsPanel'
import { AskBox } from './AskBox'
import {
  connectTelegram,
  downloadChecklist,
  downloadIcs,
  waitForTelegramConnection,
} from '@/lib/api'
import { fechaLegible, googleCalendarUrlDe } from '@/lib/google-calendar'

type Props = {
  result: DiagnosisResult
  onRestart: () => void
}

function toolsWithTelegram(
  base: ToolEvent[],
  tgStatus: TelegramStatus,
): ToolEvent[] {
  const withoutReminder = base.filter((t) => t.name !== 'enviar_recordatorio')
  if (tgStatus === 'idle') return withoutReminder

  const reminder: ToolEvent =
    tgStatus === 'sending'
      ? {
          name: 'enviar_recordatorio',
          status: 'running',
          summary: 'Esperando confirmación en Telegram…',
        }
      : tgStatus === 'sent'
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

  // El resultado siempre trae al menos un vencimiento; esto solo cubre el tipo.
  const respaldo: CalendarioEvento = {
    fecha: '2026-08-17',
    titulo: 'Vencimiento fiscal',
    descripcion: 'Consultá tu calendario en TributInfo.',
  }
  return { fecha: respaldo.fecha, concepto: respaldo.titulo, evento: respaldo }
}

export function ResultScreen({ result, onRestart }: Props) {
  const [tgStatus, setTgStatus] = useState<TelegramStatus>('idle')
  const [tgError, setTgError] = useState<string | null>(null)

  const proximo = proximoVencimiento(result.calendario.eventos)

  async function handleTelegram() {
    setTgStatus('sending')
    setTgError(null)
    const telegramWindow = window.open('about:blank', '_blank')

    try {
      const connection = await connectTelegram({
        regimen: result.regimen,
        proximoVencimiento: proximo.fecha,
        concepto: proximo.concepto,
        linkCalendario: googleCalendarUrlDe(proximo.evento),
      })
      if (connection.telegramUrl) {
        if (!telegramWindow) {
          throw new Error(
            'El navegador bloqueó Telegram. Permití las ventanas emergentes e intentá de nuevo.',
          )
        }
        telegramWindow.opener = null
        telegramWindow.location.href = connection.telegramUrl
      } else {
        telegramWindow?.close()
      }

      await waitForTelegramConnection(connection.token)
      setTgStatus('sent')
    } catch (err) {
      telegramWindow?.close()
      setTgStatus('error')
      setTgError(
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
              Guardá los vencimientos en tu Google Calendar y recibilos por
              Telegram.
            </p>

            <button
              type="button"
              className="btn btn--telegram btn--block"
              onClick={handleTelegram}
              disabled={tgStatus === 'sending' || tgStatus === 'sent'}
            >
              {tgStatus === 'sending' && 'Confirmá en Telegram…'}
              {tgStatus === 'sent' && 'Enviado ✓'}
              {(tgStatus === 'idle' || tgStatus === 'error') &&
                'Enviármelo por Telegram'}
            </button>
            <p className="gcal-hint">
              Se abrirá Telegram para conectar tu cuenta. No necesitás buscar ni
              copiar ningún identificador.
            </p>

            {tgStatus === 'sent' && (
              <p className="wa-status wa-status--ok" role="status">
                Calendario enviado. Revisá Telegram en el celular.
              </p>
            )}
            {tgStatus === 'error' && tgError && (
              <p className="wa-status wa-status--err" role="alert">
                {tgError}
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

        <ToolsPanel tools={toolsWithTelegram(result.tools, tgStatus)} />
      </div>
    </section>
  )
}
