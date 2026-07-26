# TributInfo

Agente tributario boliviano para el **Cursor Buildathon Bolivia 2026**.

Con una entrevista corta, TributInfo recomienda el régimen (General, Simplificado, STI o RAU), estima cuánto pagarías con tablas verificadas del SIN, arma el calendario de vencimientos y entrega una checklist de inscripción al NIT. Las reglas y montos son determinísticos; Gemini responde consultas libres sobre normativa con RAG sobre el corpus oficial.

## Stack

| Pieza | Tecnología |
|---|---|
| Frontend | Vite + React + TypeScript (carpeta `client/`) |
| Backend | Node.js + TypeScript (carpeta `backend/`) |
| Deploy frontend | Netlify |
| Deploy backend | Render |
| IA (consultas / RAG) | Google Gemini |
| Mensajería | Zavu → Telegram |
| Búsqueda web normativa | Exa (dominio `impuestos.gob.bo`) |
| Evaluación | Adaption |
| Calendario | Links “Añadir a Google Calendar” + archivo `.ics` |
| MCP (opcional, local) | Tools de calendario en Cursor — ver `backend/mcp/README.md` |

## Qué hace el producto

1. **Diagnóstico** — actividad, clientes, ventas, capital (y datos STI/RAU si aplica).
2. **Tools en pantalla** — `buscar_normativa`, `clasificar_regimen`, `calcular_impuestos`, `generar_calendario`.
3. **Resultado** — régimen, justificación con fuente, cálculo, vencimientos.
4. **Entrega** — resumen y checklist por Telegram; Google Calendar; descarga de checklist y `.ics`.
5. **Preguntas libres** — `POST /api/ask` con RAG sobre `corpus/parsed/`.

## Monorepo

```
client/          # Frontend Vite
backend/         # API + tools + RAG
corpus/          # Markdown oficial del SIN
planillas/       # Tablas fuente (CSV) de cuotas y vencimientos
docs/            # Contrato de datos y overview del proyecto
```

## Correr en local

```bash
pnpm install
pnpm dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  

Solo uno de los dos:

```bash
pnpm --filter tributinfo-client dev
pnpm --filter tributinfo-backend dev
```

### Variables

**Client** — copiá `client/.env.example` → `client/.env`:

```
VITE_DATA_SOURCE=real
VITE_API_URL=http://localhost:3001
```

Con `VITE_DATA_SOURCE=mock` el frontend no llama al API (útil para UI).

**Backend** — copiá `backend/.env.example` → `backend/.env` y completá al menos:

| Variable | Para qué |
|---|---|
| `GOOGLE_AI_API_KEY` | Gemini (consultas / RAG) |
| `ZAVU_API_KEY` | Envío por Telegram |
| `ZAVU_SENDER_ID` | Sender de Zavu con canal Telegram activo |
| `TELEGRAM_BOT_USERNAME` | Usuario del bot (sin `@`) |
| `ZAVU_WEBHOOK_SECRET` o `ZAVU_WEBHOOK_TOKEN` | Webhook de mensajes entrantes |
| `EXA_API_KEY` | Opcional; refuerzo web de normativa |
| `NEXT_PUBLIC_APP_URL` | URL pública del API (links en mensajes) |

## API principal

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/diagnose` | Diagnóstico completo |
| `POST` | `/api/ask` | Pregunta libre (RAG + Gemini) |
| `POST` | `/api/buscar-normativa` | Búsqueda en corpus (+ Exa si hay key) |
| `POST` | `/api/telegram/connect` | Inicia conexión Telegram (deep link) |
| `GET` | `/api/telegram/connect?token=` | Estado de la conexión |
| `POST` | `/api/telegram` | Envío directo (chatId) |
| `POST` | `/api/zavu/webhook` | Inbound Telegram → respuesta RAG |
| `GET` | `/api/descargar-calendario` | Descarga `.ics` |
| `GET` | `/health` | Health check |

Contrato tipado: [`docs/contrato-datos.md`](docs/contrato-datos.md) y `client/src/lib/types.ts`.

## Deploy

### Frontend (Netlify)

Configurado en `netlify.toml`:

- Base: `client`
- Build: `pnpm build`
- Publish: `dist`
- `VITE_DATA_SOURCE=real`
- `VITE_API_URL` → URL del backend en Render

### Backend (Render)

Configurado en `render.yaml` (`rootDir: backend`). Secretos en el dashboard de Render (`GOOGLE_AI_API_KEY`, keys de Zavu, etc.).

Webhook de Zavu (Sender → Webhooks):

```
URL: https://<tu-api>.onrender.com/api/zavu/webhook?token=<ZAVU_WEBHOOK_TOKEN>
Evento: message.inbound
```

Tras el deploy, `GET /health` confirma si Gemini y Telegram están configurados (sin exponer secretos).

## Datos y fuentes

- Planillas CSV en `planillas/` → reflejadas en `backend/lib/data/`.
- Corpus en `corpus/parsed/` (leyes, RND, calendario, RNC).
- Regla del equipo: **ningún monto inventado**. Si falta un dato, se marca y no se inventa.

## Scripts útiles

```bash
pnpm test:tools          # Tools determinísticas
pnpm test:zavu           # Envío de prueba por Zavu/Telegram
pnpm typecheck
pnpm --filter tributinfo-backend test:rag   # Benchmark RAG / Adaption
pnpm --filter tributinfo-backend mcp        # Servidor MCP local
```

## Documentación

| Doc | Contenido |
|---|---|
| [`docs/contrato-datos.md`](docs/contrato-datos.md) | Contrato frontend ↔ backend |
| [`docs/plan-tributinfo.md`](docs/plan-tributinfo.md) | Overview del proyecto (as-built) |
| [`backend/mcp/README.md`](backend/mcp/README.md) | MCP + Google Calendar API |
| [`backend/eval/README.md`](backend/eval/README.md) | Evaluación con Adaption |
| [`corpus/README.md`](corpus/README.md) | Corpus SIN |
| [`planillas/README.md`](planillas/README.md) | Tablas fuente |

## Equipo

| Persona | Rol |
|---|---|
| Fernanda | Corpus, QA, pitch |
| Gabriel | Frontend |
| Leandro | Agente, RAG |
| Leonardo | Tools determinísticas, calendario, Telegram/Zavu |

Orientación informativa. No constituye asesoría fiscal.
