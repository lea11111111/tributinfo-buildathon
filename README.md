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
3. **Resultado** — régimen, cálculo, WhatsApp, .ics y checklist

## Publicar en Netlify

La app vive en la carpeta `client`. En Netlify (Site configuration → Build & deploy → Build settings) tiene que quedar así:

| Ajuste | Valor |
|--------|--------|
| Base directory | `client` |
| Build command | `pnpm build` |
| Publish directory | `dist` |

También está el archivo `netlify.toml` en la raíz del repo, que configura lo mismo automáticamente.

Si ves **Page not found**, casi seguro el Publish directory está mal (por ejemplo vacío o apuntando a la raíz en vez de `client/dist`).
