# TributInfo

Agente tributario boliviano — frontend (Vite + React + TypeScript + Tailwind).

## Correr en local

Desde la raíz del repo (frontend + backend en paralelo):

```bash
pnpm install
pnpm dev
```

- Frontend: `http://localhost:5173` (Vite)
- Backend API: `http://localhost:3001`

Solo frontend o solo backend:

```bash
pnpm --filter tributinfo-client dev
pnpm --filter tributinfo-backend dev
```

## Datos mock vs reales

Por defecto usa mocks (`VITE_DATA_SOURCE=mock`). Copiá `client/.env.example` a `client/.env` y cambiá a `real` cuando el backend esté listo.

## Pantallas

1. **Inicio** — Empezar + 3 casos de ejemplo
2. **Entrevista** — diagnóstico por botones + panel de tools
3. **Resultado** — régimen, cálculo, Telegram, .ics y checklist

## Publicar en Netlify

La app vive en la carpeta `client`. En Netlify (Site configuration → Build & deploy → Build settings) tiene que quedar así:

| Ajuste | Valor |
|--------|--------|
| Base directory | `client` |
| Build command | `pnpm build` |
| Publish directory | `dist` |

También está el archivo `netlify.toml` en la raíz del repo, que configura lo mismo automáticamente.

Si ves **Page not found**, casi seguro el Publish directory está mal (por ejemplo vacío o apuntando a la raíz en vez de `client/dist`).

## Publicar el backend en Render

El archivo `render.yaml` en la raíz configura solo la API (`backend/`).

1. Render → **New** → **Blueprint** → conectar este repo.
2. Agregar en **Environment** los secretos requeridos:
   - `GOOGLE_AI_API_KEY`
   - `ZAVU_API_KEY`
   - `ZAVU_SENDER_ID`
   - `ZAVU_WEBHOOK_SECRET`
   - `ZAVU_WEBHOOK_TOKEN`
   - `TELEGRAM_BOT_USERNAME` (usuario del bot, sin `@`)
3. Las variables no secretas ya están declaradas en `render.yaml`:
   - `AI_PROVIDER=google`
   - `GOOGLE_AI_MODEL=gemini-3.1-flash-lite`
   - `ZAVU_CHANNEL=telegram`
   - `NEXT_PUBLIC_APP_URL=https://tributinfo-buildathon-1.onrender.com`
4. Configurar el webhook del Sender de Zavu con:
   - URL: `https://tributinfo-buildathon-1.onrender.com/api/zavu/webhook?token=<ZAVU_WEBHOOK_TOKEN>`
   - Evento: `message.inbound`
5. Netlify ya queda configurado por `netlify.toml` con:
   - `VITE_DATA_SOURCE=real`
   - `VITE_API_URL=https://tributinfo-buildathon-1.onrender.com`

Después del deploy, `GET /health` confirma sin exponer secretos si Google AI,
Telegram y el webhook están configurados.

Si configurás el servicio a mano (sin Blueprint):

| Ajuste | Valor |
|--------|--------|
| Root Directory | `backend` |
| Build Command | `corepack enable && corepack prepare pnpm@11.10.0 --activate && pnpm install` |
| Start Command | `pnpm start` |
