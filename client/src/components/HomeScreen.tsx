import type { ExampleCase } from '@/lib/types'
import { EXAMPLE_CASES } from '@/lib/mock-data'

type Props = {
  onStart: () => void
  onExample: (example: ExampleCase) => void
}

export function HomeScreen({ onStart, onExample }: Props) {
  return (
    <section className="screen home-screen">
      <div className="home-screen__glow" aria-hidden />
      <div className="home-screen__content">
        <p className="brand">TributInfo</p>
        <h1>
          Te decimos qué régimen tributario te corresponde y te dejamos el
          calendario listo.
        </h1>
        <p className="home-screen__lead">
          Entrevista corta, decisión con herramientas, y entrega accionable:
          Telegram, .ics y checklist de NIT.
        </p>
        <button type="button" className="btn btn--primary btn--lg" onClick={onStart}>
          Empezar
        </button>

        <div className="example-cases">
          <p className="example-cases__label">O probá un caso de ejemplo</p>
          <div className="example-cases__grid">
            {EXAMPLE_CASES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="example-card"
                onClick={() => onExample(c)}
              >
                <span className="example-card__title">{c.title}</span>
                <span className="example-card__sub">{c.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="disclaimer">
          Orientación informativa, no constituye asesoría fiscal.
        </p>
      </div>
    </section>
  )
}
