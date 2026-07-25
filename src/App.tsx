import { useState } from 'react'
import { HomeScreen } from '@/components/HomeScreen'
import { InterviewScreen } from '@/components/InterviewScreen'
import { ResultScreen } from '@/components/ResultScreen'
import { diagnose } from '@/lib/api'
import { createInitialTools } from '@/lib/mock-data'
import type {
  AppStep,
  DiagnosisInput,
  DiagnosisResult,
  ExampleCase,
  ToolEvent,
} from '@/lib/types'

const EMPTY_INPUT: DiagnosisInput = {
  actividad: 'comercio',
  tipoClientes: 'consumidores',
  ventasMensuales: 0,
  capital: 0,
}

export default function App() {
  const [step, setStep] = useState<AppStep>('home')
  const [input, setInput] = useState<DiagnosisInput>(EMPTY_INPUT)
  const [tools, setTools] = useState<ToolEvent[]>(createInitialTools())
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function goHome() {
    setStep('home')
    setInput(EMPTY_INPUT)
    setTools(createInitialTools())
    setResult(null)
    setBusy(false)
    setError(null)
  }

  function startBlank() {
    setInput(EMPTY_INPUT)
    setTools(createInitialTools())
    setResult(null)
    setError(null)
    setStep('interview')
  }

  function startExample(example: ExampleCase) {
    setInput(example.input)
    setTools(createInitialTools())
    setResult(null)
    setError(null)
    setStep('interview')
  }

  async function runDiagnosis(next: DiagnosisInput) {
    setInput(next)
    setBusy(true)
    setError(null)
    setTools(createInitialTools())
    setStep('interview')

    try {
      const diagnosis = await diagnose(next, setTools)
      setResult(diagnosis)
      setStep('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo falló.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell">
      {step === 'home' && (
        <HomeScreen onStart={startBlank} onExample={startExample} />
      )}

      {(step === 'interview' || (step === 'result' && busy)) && (
        <InterviewScreen
          initial={input}
          tools={tools}
          stepLabel={busy ? 'Analizando con el agente…' : 'Completá el diagnóstico'}
          busy={busy}
          onSubmit={runDiagnosis}
          onBack={goHome}
        />
      )}

      {step === 'result' && result && !busy && (
        <ResultScreen result={result} onRestart={goHome} />
      )}

      {error && (
        <div className="toast toast--error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}
