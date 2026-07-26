# Evaluación con Adaption

Set de evaluación para el RAG. **Lo sintético son las preguntas, nunca las respuestas**:
cada variante hereda la respuesta correcta de su semilla (planillas verificadas).

## 1. Semillas

`semillas.jsonl` — preguntas base con respuesta y fuente. Subir a Adaption
(web o SDK).

## 2. Adaptación

Instrucción sugerida:

> Genera 20–30 variantes de cada pregunta, como las haría un emprendedor
> boliviano informal: jerga local, errores de tipeo, ambigüedad. NO cambies
> el significado ni generes respuestas — solo preguntas. Conserva el `id`
> de la semilla.

## 3. Exportar

Guardar en `backend/eval/variantes-adaption.jsonl` (una variante por línea).
Revisar y descartar variantes sin sentido.

## 4. Benchmark

```bash
pnpm --filter tributinfo-backend test:rag
```

Reporta % de acierto sobre casos base + variantes.
