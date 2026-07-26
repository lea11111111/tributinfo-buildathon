# Corpus SIN — TributInfo

Markdown parseado de documentos oficiales del Servicio de Impuestos Nacionales (Bolivia).
Es la base del RAG (`buscar_normativa` / `/api/ask`).

## Contenido (`parsed/`)

- `01-ley-2492-codigo-tributario.md`
- `02-ley-843-impuestos.md`
- `03-ley-2166-sin.md`
- `04-calendario-tributario-2026.md`
- `05-cartilla-retenciones.md`
- `06-texto-puct.md`
- `07-tomo-i-compendio-rnd.md`
- `08-tomo-ii-compendio-rnd.md`
- `09-texto-rcv.md`
- `10-rnc-inscripcion-nit.md` — checklist NIT / RNC
- `11-rau-cuotas-2024.md` — cuotas RAU

Catálogo de URLs oficiales: `urls_oficiales_sin.txt`.

## Regenerar índice de embeddings (local)

```bash
pnpm --filter tributinfo-backend run build:embeddings
```

Genera:

- `backend/.cache/embeddings.json` (gitignored)
- `corpus/stats.json` (resumen liviano)

Si no hay cache, el backend indexa desde `corpus/parsed/` al arrancar.
