import type { ToolEvent, ToolStatus } from '@/lib/types'
import { TOOL_LABELS } from '@/lib/mock-data'

const STATUS_COPY: Record<ToolStatus, string> = {
  waiting: 'En espera',
  running: 'Ejecutando...',
  done: 'Listo',
  error: 'Error',
}

function StatusIcon({ status }: { status: ToolStatus }) {
  if (status === 'done') {
    return (
      <span className="tool-icon tool-icon--done" aria-hidden>
        ✓
      </span>
    )
  }
  if (status === 'running') {
    return (
      <span className="tool-icon tool-icon--running" aria-hidden>
        ◌
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="tool-icon tool-icon--error" aria-hidden>
        !
      </span>
    )
  }
  return (
    <span className="tool-icon tool-icon--waiting" aria-hidden>
      ○
    </span>
  )
}

type Props = {
  tools: ToolEvent[]
}

export function ToolsPanel({ tools }: Props) {
  return (
    <aside className="tools-panel" aria-label="Herramientas del agente">
      <header className="tools-panel__header">
        <h2>Qué está haciendo</h2>
        <p>Herramientas ejecutadas</p>
      </header>
      <ul className="tools-panel__list">
        {tools.map((tool) => (
          <li key={tool.name} className={`tool-row tool-row--${tool.status}`}>
            <StatusIcon status={tool.status} />
            <div className="tool-row__body">
              <code>{TOOL_LABELS[tool.name]}</code>
              <span>
                {tool.summary ?? STATUS_COPY[tool.status]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
