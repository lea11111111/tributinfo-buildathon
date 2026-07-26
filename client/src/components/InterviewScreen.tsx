import { useState } from 'react'
import type {
  ActividadRau,
  CertificadoNoImponibilidadRau,
  DiagnosisInput,
  TipoTransporte,
  UbicacionSti,
} from '@/lib/types'
import {
  ACTIVIDAD_OPTIONS,
  CLIENTES_OPTIONS,
  RAU_ZONA_OPTIONS,
  TIPO_TRANSPORTE_OPTIONS,
  UBICACION_STI_OPTIONS,
} from '@/lib/mock-data'
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

const EXCLUIDOS_STI: TipoTransporte[] = [
  'interdepartamental_internacional',
  'flota_radio_taxi',
]

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
  const [tipoTransporte, setTipoTransporte] = useState<TipoTransporte | ''>(
    initial.tipoTransporte ?? '',
  )
  const [ubicacionSti, setUbicacionSti] = useState<UbicacionSti | ''>(
    initial.ubicacionSti ?? '',
  )
  const [actividadRau, setActividadRau] = useState<ActividadRau | ''>(
    initial.actividadRau ?? '',
  )
  const [hectareasRau, setHectareasRau] = useState(
    String(initial.hectareasRau || ''),
  )
  const [zonaRau, setZonaRau] = useState(initial.zonaRau ?? '')
  const [certificadoRau, setCertificadoRau] = useState<
    CertificadoNoImponibilidadRau | ''
  >(initial.certificadoNoImponibilidadRau ?? '')

  const esTransporte = actividad === 'transporte'
  const esRau = actividad === 'agropecuario'
  const necesitaUbicacion =
    esTransporte &&
    !!tipoTransporte &&
    !EXCLUIDOS_STI.includes(tipoTransporte)
  const zonasRauDisponibles = actividadRau
    ? RAU_ZONA_OPTIONS.filter((option) =>
        option.actividades.includes(actividadRau),
      )
    : []

  const canSubmit =
    !busy &&
    Number(ventasMensuales) > 0 &&
    Number(capital) >= 0 &&
    actividad &&
    tipoClientes &&
    (!esTransporte || !!tipoTransporte) &&
    (!necesitaUbicacion || !!ubicacionSti) &&
    (!esRau ||
      (!!actividadRau &&
        Number(hectareasRau) > 0 &&
        !!zonaRau &&
        !!certificadoRau))

  function handleActividad(value: DiagnosisInput['actividad']) {
    setActividad(value)
    if (value !== 'transporte') {
      setTipoTransporte('')
      setUbicacionSti('')
    }
    if (value !== 'agropecuario') {
      setActividadRau('')
      setHectareasRau('')
      setZonaRau('')
      setCertificadoRau('')
    }
  }

  function handleTipoTransporte(value: TipoTransporte) {
    setTipoTransporte(value)
    if (EXCLUIDOS_STI.includes(value)) {
      setUbicacionSti('')
    }
  }

  function handleActividadRau(value: ActividadRau) {
    setActividadRau(value)
    const zonaActual = RAU_ZONA_OPTIONS.find((option) => option.value === zonaRau)
    if (zonaActual && !zonaActual.actividades.includes(value)) {
      setZonaRau('')
    }
  }

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      actividad,
      tipoClientes,
      ventasMensuales: Number(ventasMensuales),
      capital: Number(capital),
      ultimoDigitoNit: initial.ultimoDigitoNit,
      ...(esTransporte && tipoTransporte
        ? {
            tipoTransporte,
            ...(necesitaUbicacion && ubicacionSti ? { ubicacionSti } : {}),
          }
        : {}),
      ...(esRau && actividadRau && zonaRau && certificadoRau
        ? {
            actividadRau,
            hectareasRau: Number(hectareasRau),
            zonaRau,
            certificadoNoImponibilidadRau: certificadoRau,
          }
        : {}),
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
                    onClick={() => handleActividad(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {esTransporte && (
              <>
                <fieldset className="q-block" disabled={busy}>
                  <legend>¿Qué tipo de transporte hacés?</legend>
                  <div className="choice-stack">
                    {TIPO_TRANSPORTE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`choice choice--wide ${tipoTransporte === opt.value ? 'choice--active' : ''}`}
                        onClick={() => handleTipoTransporte(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {necesitaUbicacion && (
                  <fieldset className="q-block" disabled={busy}>
                    <legend>¿Dónde operás principalmente?</legend>
                    <div className="choice-stack">
                      {UBICACION_STI_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`choice choice--wide ${ubicacionSti === opt.value ? 'choice--active' : ''}`}
                          onClick={() => setUbicacionSti(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
              </>
            )}

            {esRau && (
              <div className="conditional-fields">
                <fieldset className="q-block" disabled={busy}>
                  <legend>¿Tu actividad principal es agrícola o pecuaria?</legend>
                  <div className="choice-grid">
                    {([
                      { value: 'agricola', label: 'Agrícola' },
                      { value: 'pecuaria', label: 'Pecuaria' },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`choice ${actividadRau === option.value ? 'choice--active' : ''}`}
                        onClick={() => handleActividadRau(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="q-block">
                  <label htmlFor="hectareas-rau">
                    ¿Cuántas hectáreas están destinadas a esa actividad?
                  </label>
                  <div className="money-input">
                    <span>ha</span>
                    <input
                      id="hectareas-rau"
                      type="number"
                      min={0.01}
                      step={0.01}
                      inputMode="decimal"
                      value={hectareasRau}
                      disabled={busy}
                      onChange={(event) => setHectareasRau(event.target.value)}
                    />
                  </div>
                </div>

                <div className="q-block">
                  <label htmlFor="zona-rau">
                    ¿Dónde está el predio y qué tipo de tierra es?
                  </label>
                  <select
                    id="zona-rau"
                    className="form-select"
                    value={zonaRau}
                    disabled={busy || !actividadRau}
                    onChange={(event) => setZonaRau(event.target.value)}
                  >
                    <option value="">
                      {actividadRau ? 'Seleccioná una zona' : 'Elegí primero la actividad'}
                    </option>
                    {zonasRauDisponibles.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="field-hint">
                    Usá la clasificación de tu título de propiedad; si dudás, confirmala
                    con el SIN.
                  </span>
                </div>

                <fieldset className="q-block" disabled={busy}>
                  <legend>¿Tenés Certificado de No Imponibilidad RAU vigente?</legend>
                  <div className="choice-grid">
                    <button
                      type="button"
                      className={`choice ${certificadoRau === 'si' ? 'choice--active' : ''}`}
                      onClick={() => setCertificadoRau('si')}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      className={`choice ${certificadoRau === 'no_no_se' ? 'choice--active' : ''}`}
                      onClick={() => setCertificadoRau('no_no_se')}
                    >
                      No o no sé
                    </button>
                  </div>
                </fieldset>
              </div>
            )}

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
