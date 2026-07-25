# Corpus SIN — TributInfo

Markdown parseado de PDFs oficiales del Servicio de Impuestos Nacionales (Bolivia).

## Contenido piloto (`parsed/`)

Copiar desde el trabajo local de ingesta:

```powershell
Copy-Item "$env:USERPROFILE\.firecrawl\sin-corpus\parsed\*.md" "corpus\parsed\" -Force
```

Documentos del piloto:
- `01-ley-2492-codigo-tributario.md`
- `03-ley-2166-sin.md`
- `04-calendario-tributario-2026.md`
- `06-texto-puct.md`
- `07-tomo-i-compendio-rnd.md`

URLs pendientes de ingestar: ver `urls_oficiales_sin.txt` (171 PDFs oficiales).

## Regenerar índice

```bash
pnpm --filter tributinfo-backend run build:embeddings
```

Genera `embeddings.json` en la raíz del repo (commiteado para demo sin infra).
