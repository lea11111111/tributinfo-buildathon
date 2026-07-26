import { useState } from 'react'
import type { AskResult } from '@/lib/types'
import { ask } from '@/lib/api'

/**
 * Consulta libre sobre normativa: manda la pregunta a /api/ask (RAG + LLM)
 * y muestra la respuesta con sus fuentes citadas.
 */
export function AskBox() {
  const [pregunta, setPregunta] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AskResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = pregunta.trim()
    if (!q || busy) return

    setBusy(true)
    setError(null)
    try {
      setResult(await ask(q))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo consultar la normativa.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="result-block">
      <h3>¿Tenés otra duda?</h3>
      <p className="muted">
        Preguntale al agente sobre la normativa. Responde citando la fuente.
      </p>

      <form className="wa-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Ej: ¿Puedo emitir factura en el Simplificado?"
          aria-label="Pregunta sobre normativa"
          disabled={busy}
        />
        <button type="submit" className="btn btn--secondary" disabled={busy}>
          {busy ? 'Consultando…' : 'Preguntar'}
        </button>
      </form>

      {error && (
        <p className="wa-status wa-status--err" role="alert">
          {error}
        </p>
      )}

      {result && !busy && (
        <div className="ask-answer" role="status">
          <p>{result.respuesta}</p>
          <p className="muted">
            Fuentes:{' '}
            {result.fragmentos
              .filter((f, i, arr) => arr.findIndex((x) => x.fuente === f.fuente) === i)
              .map((f, i) => (
                <span key={f.fuente}>
                  {i > 0 && ' · '}
                  {f.url ? (
                    <a className="cite-link" href={f.url} target="_blank" rel="noreferrer">
                      {f.fuente}
                    </a>
                  ) : (
                    f.fuente
                  )}
                </span>
              ))}
          </p>
        </div>
      )}
    </div>
  )
}
