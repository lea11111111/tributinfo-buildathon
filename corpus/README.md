# Corpus SIN — TributInfo

Markdown parseado de PDFs oficiales del Servicio de Impuestos Nacionales (Bolivia).

## Contenido piloto (`parsed/`)

Copiar desde el trabajo local de ingesta:

```powershell
Copy-Item "$env:USERPROFILE\.firecrawl\sin-corpus\parsed\*.md" "corpus\parsed\" -Force
```

Documentos parseados:

- `01-ley-2492-codigo-tributario.md`
- `02-ley-843-impuestos.md`
- `03-ley-2166-sin.md`
- `04-calendario-tributario-2026.md`
- `05-cartilla-retenciones.md`
- `06-texto-puct.md`
- `07-tomo-i-compendio-rnd.md`
- `08-tomo-ii-compendio-rnd.md`
- `09-texto-rcv.md`
- `10-rnc-inscripcion-nit.md` — checklist NIT / RNC (Anexo Técnico + RND 1025/1026)

Pendiente: `11-rnd-estados-financieros.md` (RND-101800000004)

URLs por ingestar: ver `urls_oficiales_sin.txt` (171 PDFs oficiales).

## Regenerar índice (local, no commitear)

```bash
pnpm --filter tributinfo-backend run build:embeddings
```

Genera:
- `backend/.cache/embeddings.json` — cache local (gitignored)
- `corpus/stats.json` — resumen liviano para el repo

Si no hay cache, el backend construye el índice en memoria desde `corpus/parsed/` al arrancar.
