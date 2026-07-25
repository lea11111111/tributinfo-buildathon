import { useState } from 'react'
import type { DiagnosisInput } from '@/lib/types'
import { ACTIVIDAD_OPTIONS, CLIENTES_OPTIONS } from '@/lib/mock-data'
import { ToolsPanel } from './ToolsPanel'
import type { ToolEvent } from '@/lib/types'

type Props = {
  initial: DiagnosisInput
  tools: ToolEvent[]
  stepLabel: string
  busy: boolean
  onSubmit: (input: DiagnosisInput) => void
  onBack: () => void
}

export function InterviewScreen({
  initial,
  tools,
  stepLabel,
  busy,
  onSubmit,
  onBack,
}: Props) {
  const [actividad, setActividad] = useState(initial.actividad)
  const [tipoClientes, setTipoClientes] = useState(initial.tipoClientes)
  const [ventasMensuales, setVentasMensuales] = useState(
    String(initial.ventasMensuales || ''),
  )
  const [capital, setCapital] = useState(String(initial.capital || ''))

  const canSubmit =
    !busy &&
    Number(ventasMensuales) > 0 &&
    Number(capital) >= 0 &&
    actividad &&
    tipoClientes

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      actividad,
      tipoClientes,
      ventasMensuales: Number(ventasMensuales),
      capital: Number(capital),
      ultimoDigitoNit: initial.ultimoDigitoNit,
    })
  }

  return (
    <section className="screen interview-screen">
      <div className="interview-layout">
        <div className="diag-panel">
          <header className="diag-panel__header">
            <div className="diag-panel__brand">
              <span className="avatar">TB</span>
              <div>
                <h2>Diagnóstico</h2>
                <p>{stepLabel}</p>
              </div>
            </div>
            <button type="button" className="btn btn--ghost" onClick={onBack} disabled={busy}>
              Volver
            </button>
          </header>

          <div className="diag-panel__body">
            <fieldset className="q-block" disabled={busy}>
              <legend>¿A qué te dedicás?</legend>
              <div className="choice-grid">
                {ACTIVIDAD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`choice ${actividad === opt.value ? 'choice--active' : ''}`}
                    onClick={() => setActividad(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="q-block" disabled={busy}>
              <legend>¿A quién le vendés?</legend>
              <div className="choice-stack">
                {CLIENTES_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`choice choice--wide ${tipoClientes === opt.value ? 'choice--active' : ''}`}
                    onClick={() => setTipoClientes(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="q-block">
              <label htmlFor="ventas">¿Cuánto vendés al mes, más o menos?</label>
              <div className="money-input">
                <span>Bs</span>
                <input
                  id="ventas"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={ventasMensuales}
                  disabled={busy}
                  onChange={(e) => setVentasMensuales(e.target.value)}
                />
              </div>
            </div>

            <div className="q-block">
              <label htmlFor="capital">¿Cuánto capital tenés en el negocio?</label>
              <div className="money-input">
                <span>Bs</span>
                <input
                  id="capital"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={capital}
                  disabled={busy}
                  onChange={(e) => setCapital(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {busy ? 'Analizando…' : 'Ver mi régimen'}
            </button>
          </div>

          <p className="disclaimer disclaimer--panel">
            Orientación informativa. No constituye asesoría fiscal.
          </p>
        </div>

        <ToolsPanel tools={tools} />
      </div>
    </section>
  )
}
