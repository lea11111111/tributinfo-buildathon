# TributInfo — overview del proyecto

**Cursor Buildathon Bolivia 2026 · Bolivia Agents Track**

## Producto

Agente que entrevista a un emprendedor boliviano, clasifica el régimen tributario (General, Simplificado, STI o RAU) y entrega:

1. Cálculo estimado de impuestos (tablas verificadas)
2. Calendario fiscal (Google Calendar + `.ics`)
3. Checklist de inscripción al NIT
4. Resumen y checklist por Telegram (Zavu)

No es un chatbot genérico: percibe el contexto del diagnóstico, ejecuta tools y entrega artefactos accionables. Los montos no los inventa el modelo; salen de `planillas/` y `backend/lib/data/`.

## Roles

| Persona | Responsabilidad |
|---|---|
| Fernanda | Corpus, QA, pitch |
| Gabriel | Frontend (entrevista, resultado, panel de tools) |
| Leandro | Loop del agente, RAG, Gemini |
| Leonardo | Tools determinísticas, calendario, entrega Telegram/Zavu |

## Sponsors / servicios usados

| Servicio | Uso en TributInfo |
|---|---|
| **Cursor** | Desarrollo del proyecto |
| **Google Gemini** | Respuestas de `/api/ask` y redacción sobre contexto RAG |
| **Zavu** | Canal Telegram (outbound + webhook inbound) |
| **Exa** | Refuerzo web de `buscar_normativa` (solo `impuestos.gob.bo`) |
| **Adaption** | Set de evaluación (variantes de preguntas; respuestas de planillas) |
| **Netlify** | Deploy del frontend |
| **Render** | Deploy del API |

## Flujo de usuario

1. Inicio → caso de ejemplo o entrevista
2. Tools visibles: normativa → régimen → cálculo → calendario
3. Resultado con fuentes
4. Telegram / Google Calendar / descargas
5. Pregunta libre opcional (Ask)

## Criterio de verdad de los datos

- Cada monto cita norma / artículo / link cuando aplica.
- Si un dato no está en planilla: no se inventa (UI: “dato no disponible”).
- Adaption genera **variantes de preguntas**, nunca montos sintéticos.

## Repo

Ver [`README.md`](../README.md) para setup local, variables, endpoints y deploy.
Ver [`contrato-datos.md`](contrato-datos.md) para el contrato tipado frontend ↔ backend.
