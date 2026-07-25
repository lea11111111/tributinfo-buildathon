import { useState } from 'react'
import type { CalendarioEvento, DiagnosisResult, WhatsAppStatus } from '@/lib/types'
import { ToolsPanel } from './ToolsPanel'
import { downloadChecklist, downloadIcs, sendWhatsApp } from '@/lib/api'

type Props = {
  result: DiagnosisResult
  onRestart: () => void
}

function formatBs(n: number) {
  return `Bs ${n.toLocaleString('es-BO')}`
}

/** Elige el evento más próximo (fecha >= hoy); si no hay, usa datos de prueba. */
function proximoVencimiento(eventos: CalendarioEvento[]): {
  fecha: string
  concepto: string
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
    }
  }
  return {
    fecha: '2026-08-17',
    concepto: 'Cuota bimestral RTS — mensaje de prueba de TributInfo',
  }
}

export function ResultScreen({ result, onRestart }: Props) {
  const [phone, setPhone] = useState('+591')
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>('idle')
  const [waError, setWaError] = useState<string | null>(null)

  async function handleWhatsApp() {
    const cleaned = phone.replace(/\s/g, '')
    if (!/^\+591\d{8}$/.test(cleaned)) {
      setWaStatus('error')
      setWaError('Usá formato boliviano: +591 y 8 dígitos.')
      return
    }

    const proximo = proximoVencimiento(result.calendario.eventos)

    setWaStatus('sending')
    setWaError(null)
    try {
      await sendWhatsApp({
        telefono: cleaned,
        regimen: result.regimen,
        proximoVencimiento: proximo.fecha,
        concepto: proximo.concepto,
      })
      setWaStatus('sent')
    } catch (err) {
      setWaStatus('error')
      setWaError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar. Descargá el calendario abajo.',
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
              El calendario va a tu WhatsApp y también lo podés descargar.
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

            <div className="download-row">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() =>
                  downloadIcs(result.calendario.filename, result.calendario.eventos)
                }
              >
                Descargar calendario (.ics)
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() =>
                  downloadChecklist(result.checklist.filename, result.checklist.pasos)
                }
              >
                Descargar checklist
              </button>
            </div>
          </div>
        </div>

        <ToolsPanel tools={result.tools} />
      </div>
    </section>
  )
}
