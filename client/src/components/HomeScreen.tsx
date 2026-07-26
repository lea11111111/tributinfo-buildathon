import { useRef } from 'react'
import type { ExampleCase } from '@/lib/types'
import { EXAMPLE_CASES } from '@/lib/mock-data'

type Props = {
  onStart: () => void
  onExample: (example: ExampleCase) => void
}

export function HomeScreen({ onStart, onExample }: Props) {
  const benefitsRef = useRef<HTMLElement>(null)

  function showBenefits() {
    benefitsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="screen home-screen">
      <div className="home-screen__glow" aria-hidden />
      <div className="home-screen__hero">
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
          <div className="home-screen__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={onStart}>
              Empezar
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--lg"
              onClick={showBenefits}
            >
              ¿Por qué pagaría impuestos?
            </button>
          </div>

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
      </div>

      <section className="benefits-section" ref={benefitsRef} tabIndex={-1}>
        <p className="benefits-section__eyebrow">Más que una obligación</p>
        <h2>Formalizarte puede abrirte nuevas oportunidades</h2>
        <p className="benefits-section__lead">
          Tener un NIT y cumplir con tus impuestos te permite operar formalmente
          y demostrar la actividad de tu negocio.
        </p>

        <div className="benefits-grid">
          <article className="benefit-card">
            <span className="benefit-card__icon" aria-hidden>01</span>
            <h3>Emitir facturas</h3>
            <p>Vendé a empresas y clientes que necesitan respaldar sus compras.</p>
          </article>
          <article className="benefit-card">
            <span className="benefit-card__icon" aria-hidden>02</span>
            <h3>Demostrar ingresos</h3>
            <p>Construí un historial que puede ayudarte al solicitar financiamiento.</p>
          </article>
          <article className="benefit-card">
            <span className="benefit-card__icon" aria-hidden>03</span>
            <h3>Acceder a más mercados</h3>
            <p>Cumplí requisitos para contratos, proveedores y procesos de compra.</p>
          </article>
          <article className="benefit-card">
            <span className="benefit-card__icon" aria-hidden>04</span>
            <h3>Crecer con orden</h3>
            <p>Conocé tus obligaciones y planificá los costos de tu negocio.</p>
          </article>
          <article className="benefit-card">
            <span className="benefit-card__icon" aria-hidden>05</span>
            <h3>Evitar contratiempos</h3>
            <p>Recordá tus vencimientos y reducí el riesgo de multas por incumplimiento.</p>
          </article>
          <article className="benefit-card">
            <span className="benefit-card__icon" aria-hidden>06</span>
            <h3>Aportar al país</h3>
            <p>Los impuestos ayudan a financiar infraestructura y servicios públicos.</p>
          </article>
        </div>

        <div className="benefits-section__cta">
          <div>
            <h3>Descubrí qué significa para tu negocio</h3>
            <p>Calculá tu régimen y una estimación de cuánto pagarías.</p>
          </div>
          <button type="button" className="btn btn--primary btn--lg" onClick={onStart}>
            Calcular mi situación
          </button>
        </div>
        <p className="benefits-section__note">
          El acceso a créditos, contratos u otras oportunidades depende de los
          requisitos de cada entidad y no está garantizado por tener NIT.
        </p>
      </section>
    </section>
  )
}
