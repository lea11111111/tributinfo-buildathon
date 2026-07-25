# TributInfo

Agente tributario boliviano — frontend (Vite + React + TypeScript + Tailwind).

## Correr en local

```bash
cd client
pnpm install
pnpm dev
```

Abrí la URL que imprime Vite (por defecto `http://localhost:5173`).

## Datos mock vs reales

Por defecto usa mocks (`VITE_DATA_SOURCE=mock`). Copiá `client/.env.example` a `client/.env` y cambiá a `real` cuando el backend esté listo.

## Pantallas

1. **Inicio** — Empezar + 3 casos de ejemplo
2. **Entrevista** — diagnóstico por botones + panel de tools
3. **Resultado** — régimen, cálculo, WhatsApp, .ics y checklist
