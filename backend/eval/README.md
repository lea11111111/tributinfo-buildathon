# Evaluación con Adaption (sponsor)

Flujo para el set de evaluación de ~300 variantes. **Lo sintético son las
preguntas, nunca las respuestas**: cada variante hereda la respuesta correcta
de su semilla, que sale de las planillas verificadas.

## 1. Subir las semillas a Adaption

`semillas.jsonl` tiene las 10 preguntas del plan con su respuesta correcta y
fuente. Subirlo en la web app de Adaption (o con su SDK de Python,
`datasets.upload_file()`).

## 2. Lanzar la adaptación

Instrucción sugerida (behavior spec / universal prompt):

> Genera 20-30 variantes de cada pregunta, como las haría un emprendedor
> boliviano informal: jerga local, errores de tipeo, ambigüedad de la vida
> real. NO cambies el significado ni generes respuestas — solo preguntas.
> Conserva el campo `id` de la semilla en cada variante.

## 3. Exportar y guardar acá

Exportar como JSONL y guardarlo en `backend/eval/variantes-adaption.jsonl`,
una variante por línea:

```jsonl
{"semillaId": "iva", "pregunta": "cuanto me descuentan de impuestos?"}
{"semillaId": "tienda-8000", "pregunta": "tengo una tiendita chiquita, cuanto pago?"}
```

**Revisar antes de usar**: descartar variantes sin sentido (impuestos que no
existen, preguntas incoherentes). Una variante mala "corrige" el agente hacia
respuestas falsas.

## 4. Correr el benchmark

```bash
pnpm --filter tributinfo-backend test:rag
```

El script corre los 16 casos base + todas las variantes, y reporta el % de
acierto. Ese número es la respuesta a "¿cómo saben que funciona?" en el Q&A,
y habilita el challenge "Best use of Adaption".
