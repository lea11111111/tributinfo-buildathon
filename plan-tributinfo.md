# Plan de equipo — Agente Tributario Boliviano

**Cursor Buildathon Bolivia 2026 · Bolivia Agents Track**
**Evento:** 25 y 26 de julio · UTEPSA, Santa Cruz
**Deadline de entrega: 26 de julio, 08:30 — sin extensiones**

---

## El producto en una frase

Un agente que entrevista a un emprendedor boliviano, decide qué régimen tributario le corresponde (General, Simplificado, STI o RAU) y le entrega tres cosas concretas: su calendario fiscal (descargable como .ics **y enviado por WhatsApp**), el checklist de inscripción al NIT, y un cálculo real de cuánto pagaría. Después le avisa antes de cada vencimiento.

**No es un chatbot.** El agente percibe contexto, decide, ejecuta herramientas y entrega un artefacto accionable. Esa distinción es literalmente lo que el track evalúa.

---

## Roles

| Persona | Rol | Entregable del que responde |
|---|---|---|
| **Fernanda** | Corpus, QA y pitch | Que lo que dice el producto sea cierto, y los 4 minutos de pitch |
| **Gabriel** | Frontend | Las tres pantallas, el panel de tools y los descargables |
| **Leandro** | Backend — agente y RAG | El loop del agente, `buscar_normativa`, los prompts |
| **Leonardo** | Backend — tools y exportables | `clasificar_regimen`, `calcular_impuestos`, `generar_calendario`, `enviar_recordatorio`, .ics y checklist |
| **[coordinación]** | Repo, deploy, README, integración | Que la URL esté viva y que las piezas se junten |

**Regla de equipo:** nadie toca el trabajo de otro sin avisar. Si algo de otra área te bloquea, se dice en voz alta, no se arregla por las tuyas.

---

## Criterios de evaluación (memorícenlos, son la cancha)

| Criterio | Peso | Quién lo mueve más |
|---|---|---|
| Claridad del problema y caso de uso | 20% | Fernanda (pitch) |
| Nivel de ejecución técnica | 25% | Leandro + Leonardo |
| Uso significativo de IA y agentes | 20% | Leandro + Gabriel (panel de tools) |
| Calidad de la demo y UX | 15% | Gabriel + Fernanda |
| Potencial real y originalidad | 20% | Fernanda (corpus publicado) + pitch |

---

## Sponsors y créditos

Los créditos se activan desde **"Mis créditos"** en el portal privado de cada participante. Varios se entregan como código compartido que hay que revelar ahí.

### ✅ Sí hay sponsor de modelo: fal.ai

**Corrección al plan original.** Decía que ningún sponsor daba créditos de modelo y clasificaba a fal.ai como generación de imágenes. Las dos cosas eran falsas.

fal.ai es sponsor confirmado y su entrega son **créditos de inferencia**. Corre modelos de texto vía OpenRouter — Claude, GPT, Gemini, Llama, Qwen y más de doscientos — con **tool calling, salida estructurada y streaming**, que es exactamente lo que este proyecto necesita. Es cierto que OpenAI, Anthropic y Google no están como sponsors directos, pero fal enruta a sus modelos igual.

**La cadena de respaldo, en orden:**

1. **fal.ai** — plan A. Créditos de sponsor.
2. **Gemini, capa gratuita de AI Studio** — plan B. No pide tarjeta. ⚠️ Habilitar facturación en ese proyecto borra la capa gratuita y todo se cobra desde el primer token; si cargan saldo, en un proyecto aparte.
3. **Modelo local vía Ollama** — plan C, para si se cae el wifi del venue. Bajar los pesos por wifi de casa, nunca en el venue.
4. **Cargar saldo con tarjeta** — recién si nada de lo anterior alcanza.

Cambiar entre los cuatro es una variable de entorno (`LLM_PROVIDER`), no un refactor: todo pasa por `lib/ai/provider.ts`.

**La incógnita que queda:** que el endpoint compatible con OpenAI de fal ate limpio con `streamText` + `tools` del AI SDK. Timebox de 30 minutos con `scripts/smoke-test.ts`. Si no ata, plan B y a otra cosa.

Embeddings: se calculan una sola vez y quedan commiteados. La capa gratuita de Google alcanza para nuestro corpus (~250 mil tokens), y es independiente de qué proveedor use el agente.

### Los que sí usamos

| Sponsor | Para qué | Quién |
|---|---|---|
| **Cursor Pro** | Escribir todo el código | Todos |
| **fal.ai** | **El modelo del agente.** Inferencia de texto con tool calling | Leandro |
| **Zavu** | Enviar el calendario y los recordatorios por WhatsApp | Leonardo |
| **Adaption** | Sacar el texto de los PDFs (solo extraer, no resumir) + generar el set de evaluación | Fernanda |
| **Firecrawl** | Bajar normativa del portal del SIN de forma estructurada | Fernanda + Leandro |
| **Exa** | Encontrar la última RND del Simplificado y verificar vigencia | Fernanda + Leandro |

**Firecrawl y Exa dejaron de ser opcionales.** El plan los tenía como un lujo para el final ("vigilancia normativa"), pero sin corpus armado pasan a ser la herramienta con la que se arma. Ojo: lo que baje una herramienta no es fuente verificada — cada documento sigue necesitando su fila en la planilla de fuentes con fecha y vigencia.

**Adaption tiene challenge propio** ("Best use of Adaption"): premio paralelo con el mismo proyecto. El acceso se activa desde el **portal**, no por correo — que Fernanda entre directamente en vez de esperar un mail que puede no llegar.

⚠️ **Lo que NO hacemos con Adaption: generar datos tributarios sintéticos.** Todo nuestro argumento es que los números salen de fuentes verificables. Si sintetizamos montos o categorías, lo destruimos y el jurado lo nota en el Q&A. Lo sintético son las *preguntas*, nunca las *respuestas*. Y para el corpus, Adaption solo **extrae** texto de los PDFs: nada de resumir ni reescribir normativa.

### Los que NO usamos

**Wallbit** — es API de cuentas, balances, trades y wallets. Nuestro producto no mueve plata. Meterlo sería agregar una función que no le sirve a doña Carmen, y el jurado lee eso como cazar sponsors.

**Render y Netlify** — dan créditos de deploy, y el argumento original ("ya tenemos Vercel funcionando") dejó de valer porque el repo arrancó vacío. Aun así nos quedamos en Vercel: el AI SDK y su streaming son de ellos, y estrenar plataforma en la hora 0 con tool calls streameados es riesgo puro por unos puntos de optics. **Vercel no es sponsor, pero el FAQ lo acepta explícitamente** y el plan gratis nos alcanza.

**ElevenLabs y Wispr Flow** quedan como plan de mejora si sobra tiempo — **la voz va después de WhatsApp**, porque WhatsApp es más simple de demostrar y no depende del audio del salón. (Wispr para dictar mientras se programa no le cuesta nada a nadie.)

---

## Cronograma común

### Antes del evento (miércoles a viernes)

| Día | Fernanda | Gabriel | Leandro | Leonardo | Coordinación |
|---|---|---|---|---|---|
| **Mié** | Descargar corpus + planilla de fuentes | Bocetos de las 3 pantallas | `buscar_normativa` contra 20 chunks | Firmar el contrato de datos con Gabriel | Repo + deploy vivo + colaboradores |
| **Jue** | Planillas de reglas (montos y fechas) | Pantallas contra datos falsos | Loop del agente con 1 tool | Tools 2 y 3 como funciones puras | Saldo del LLM cargado y key probada |
| **Vie** | Corpus cortado + 10 preguntas + Adaption (extraer PDFs y set de evaluación) + borrador de pitch | Panel de tools y pantalla de resultado | Prueba end-to-end fea pero real | Tool 4 (.ics) y alta en Zavu con un envío de prueba real | Ensayo de deploy y plan B de red |

### Durante las 24 horas

| Horas | Objetivo | Checkpoint |
|---|---|---|
| 0-2 | Kickoff, créditos de sponsors, re-deploy | La URL responde |
| 2-6 | RAG end-to-end con citas | "¿Qué es el RTS?" responde citando la norma |
| 6-11 | Las 4 tools conectadas al agente | El agente clasifica un caso y calcula |
| 11-15 | Descargables + envío por WhatsApp + panel de tools visible | Llega un calendario real a un celular |
| 15-18 | UI pulida, errores, estados de carga | Nada se ve roto |
| 18-20 | README (<5 pasos) y repo limpio | Un extraño puede correrlo |
| 20-22 | Ensayar demo ×5, grabar video de respaldo | El pitch fluye en 4 min |
| 22-24 | Buffer para lo que se rompió | Dormir si sobra |

**Regla de oro:** a la hora 12 tiene que existir una versión demoable de punta a punta, aunque sea fea. Todo lo demás es mejora incremental. Fernanda es la encargada de exigirlo en voz alta.

---

## Reglas que aplican a todos

- **Ningún número sale del modelo.** Todos los montos y fechas salen de las tools determinísticas, que copian los datos de las planillas de Fernanda.
- **Ningún dato hardcodeado llega a la demo.** El track descarta explícitamente demos que solo funcionan con datos fijos. Los mocks son andamio de desarrollo y se apagan con una sola línea.
- **La demo es en vivo.** El video grabado es seguro interno, no reemplaza nada.
- **Nada de API keys en el repo.** Van en `.env` (ignorado) y en las variables de entorno de Vercel. En el repo solo `.env.example`.
- **En el pitch no se dice "chatbot".** Y "RAG" como máximo una vez, si preguntan por arquitectura.
- **Orden de recorte si falta tiempo:** primero cae la vigilancia normativa (si se agrega), después la calculadora, después el checklist. El calendario .ics, la clasificación y el envío por WhatsApp NO se negocian: son el momento wow.
- **Hay un proveedor de modelo verificado y una cadena de respaldo.** fal.ai (sponsor) → Gemini free tier → local → tarjeta. Cambiar entre ellos es una variable de entorno. Responsable: Leandro para la validación técnica, coordinación para los créditos.

---

# FERNANDA — Corpus, QA y pitch

## Qué hacés en este equipo

Tu rol no requiere programar, y no es un rol de apoyo: **es el rol del que depende que el producto diga la verdad.**

El equipo puede escribir código perfecto y aun así perder si el agente le dice a alguien que su cuota es Bs 100 cuando son Bs 300. Ese número no sale del código ni de la inteligencia artificial: sale de una resolución del SIN que alguien tiene que buscar, leer y verificar.

Tus cuatro entregables: el corpus, la planilla de reglas, el QA y el pitch.

## Antes de arrancar: 30 minutos de contexto

No necesitás saber de impuestos de antes. Necesitás poder leer un documento oficial y verificar lo que dice, que es lo mismo que hacés con la bibliografía en veterinaria.

Usá Claude o Cursor para explicarte lo que no entiendas:

- ¿Qué es un régimen tributario y cuáles existen en Bolivia?
- ¿Qué diferencia hay entre IVA, IT e IUE?
- ¿Qué es el NIT y para qué sirve?
- ¿Qué es una alícuota?
- ¿Qué es una RND del SIN?

**Regla de oro:** lo que te explique la IA sirve para entender. **No sirve como fuente.** Todo número que vaya a la planilla tiene que salir de un documento oficial del SIN, con link. Si un modelo te dice un monto, tratalo como un rumor hasta que lo confirmes.

## Miércoles — Conseguir el corpus

Sitio oficial: **impuestos.gob.bo**

- [ ] **Ley 843 (Texto Ordenado)** — la ley madre. Es larga, no hace falta leerla entera todavía.
- [ ] **Normativa del Régimen Tributario Simplificado (RTS)** — categorías, topes de capital, topes de ventas, cuotas.
- [ ] **Última RND que actualiza categorías o montos del Simplificado.** La más importante y la más escondida. Buscá en normativa/resoluciones ordenada por fecha.
- [ ] **Calendario de vencimientos vigente** por último dígito de NIT.
- [ ] **Guías de inscripción al NIT** — requisitos, pasos, documentos.
- [ ] **Normativa de facturación**, incluida la electrónica.
- [ ] **Régimen Agropecuario Unificado (RAU)** — qué es y a quién aplica.
- [ ] **Sistema Tributario Integrado (STI)** — qué es y a quién aplica.
- [ ] **Material de "cultura tributaria" del SIN** — explicaciones simples, oro para que el agente responda en lenguaje entendible.

Con 20 a 40 documentos alcanza. Más no es mejor.

Guardalos en `corpus/` con nombres descriptivos:

```
corpus/
  ley-843-texto-ordenado.pdf
  rnd-2026-XX-categorias-rts.pdf
  calendario-vencimientos-2026.pdf
  guia-inscripcion-nit.pdf
```

### La planilla de fuentes

| archivo | título oficial | tipo | fecha de publicación | URL de descarga | ¿vigente? |
|---|---|---|---|---|---|

Es un entregable en sí mismo: el track pide documentar fuentes y el jurado puede preguntar de dónde salieron los datos.

**Si un documento no tiene fecha visible o no estás segura de que esté vigente, marcalo en rojo y avisá.** Un documento derogado es peor que no tener el documento.

## Jueves — La planilla de reglas (tu entregable más importante)

De acá copian Leandro y Leonardo para escribir las tools. Si esto está mal, el producto miente.

### Planilla 1 — Categorías del Simplificado

| categoría | capital desde (Bs) | capital hasta (Bs) | ventas anuales hasta (Bs) | cuota bimestral (Bs) | fuente (norma + artículo) | link |
|---|---|---|---|---|---|---|

Agregá notas con: qué actividades están excluidas, qué pasa si alguien supera el tope, desde qué fecha rigen estos montos.

### Planilla 2 — Impuestos del Régimen General

| impuesto | sigla | alícuota | periodicidad | sobre qué base se calcula | fuente (artículo) | link |
|---|---|---|---|---|---|---|

Cubrí al menos IVA, IT e IUE.

### Planilla 3 — Calendario de vencimientos

| último dígito del NIT | día de vencimiento | qué se declara | fuente | link |
|---|---|---|---|---|

Si el vencimiento cambia según el impuesto o el régimen, una fila por combinación. Mejor que sobren filas a que el agente adivine.

### Planilla 4 — Checklist de inscripción al NIT

Pasos ordenados: qué documentos, presencial o en línea, dónde, cuánto demora. Cada paso con su fuente.

### Regla que no se negocia

**Ninguna celda vacía y ninguna celda sin link.** Si no encontrás un dato, escribí `NO ENCONTRADO` en rojo y avisá ese mismo día. Un dato faltante que el equipo conoce es manejable; un dato inventado que nadie detectó es una demo perdida.

## Viernes — Cortes del corpus y preguntas de prueba

### Parte 1 — Marcar los cortes

Hay que partir los documentos en pedazos ("chunks"), y **dónde se corta lo decide una persona que entendió el documento**, no un script a ciegas. La regla: **se corta por artículo, nunca a la mitad de un artículo.**

| id | fuente | artículo | texto | link |
|---|---|---|---|---|
| ley843-art-15 | Ley 843 (Texto Ordenado) | Art. 15 | *(texto del artículo)* | https://... |

- **Artículos muy cortos** (menos de ~50 palabras): juntalos con el siguiente.
- **Artículos muy largos** (más de ~2 páginas): partilos en dos o tres, repitiendo las últimas líneas del anterior al inicio del siguiente.
- **Tablas de categorías**: cada categoría es su propio pedazo, con sus montos. Si va la tabla entera junta, el agente tiene que elegir entre cinco filas de números y ahí se equivoca.

Coordiná con Leandro cómo entregarlo (planilla o archivo de texto).

### Parte 2 — Las 10 preguntas de prueba

Cada una **con la respuesta correcta al lado y el artículo que la respalda**. Sin la respuesta escrita de antemano no podés evaluar nada: solo podrías decir "suena bien".

| # | pregunta | respuesta correcta | artículo/norma |
|---|---|---|---|

Para arrancar:

1. ¿Puedo estar en el Simplificado si vendo por internet?
2. Tengo una tienda de barrio y vendo como Bs 8.000 al mes, ¿qué régimen me toca?
3. Soy programador y facturo a clientes del exterior, ¿qué impuestos pago?
4. ¿Cuánto es el IVA en Bolivia?
5. ¿Cada cuánto se paga en el Simplificado?
6. Mi NIT termina en 4, ¿cuándo vence mi declaración?
7. ¿Qué necesito para sacar el NIT?
8. ¿Qué pasa si me paso del tope del Simplificado?
9. ¿Puedo emitir factura estando en el Simplificado?
10. Tengo un terreno y produzco papa, ¿qué régimen me corresponde?

### Parte 3 — Adaption: dos usos, y un límite que no se cruza

Adaption sirve para dos cosas distintas. Ninguna toca el código del agente, así que si algo falla, no bloquea a nadie.

**Uso 1 — sacar el texto de los PDFs.** Su función Forge acepta PDFs crudos, incluso escaneados, y devuelve el texto sin que haya que escribir ningún pipeline. Te ahorra horas de copiar y pegar.

⛔ **Y ahí se corta.** Adaption puede *sacar* el texto del PDF; no puede resumirlo ni reescribirlo. La documentación va a ofrecerte flujos que generan un prompt automático, o que corren uno universal del tipo "resumí los hechos clave de este documento". **Eso no se usa para el corpus.** Es paráfrasis, y el corpus necesita el texto legal textual, porque el agente después lo cita como si fuera la ley. Si un jurado abre el link y el artículo no dice lo que citamos, se cae todo — y es peor que no tener corpus, porque se ve bien.

> Regla: Forge extrae → vos verificás contra el PDF original → recién ahí es chunk.

**Uso 2 — el set de evaluación.** Acá sí, sin reservas: es exactamente para lo que está hecho.

Tus 10 preguntas están escritas por alguien que ya leyó la norma, así que usan el vocabulario de la norma. **El usuario real no habla así.** La brecha entre "¿cuál es la alícuota del IVA?" y "¿cuánto me descuentan?" es justo donde el sistema se rompe, y solo se ve con volumen.

Ojo con cómo funciona: **Adaption adapta datos que ya existen, no genera de la nada.** Tus 10 preguntas son la semilla de la que salen las 200-300 variantes — no se desperdician, son el insumo.

- "vendo salteñas en la puerta de mi casa, ¿tengo que sacar NIT?"
- "me dijeron que hay un régimen más barato, ¿cuál es?"
- "tengo una tiendita chiquita, ¿cuánto pago?"

**Lo sintético son las preguntas, nunca las respuestas.** La respuesta correcta sigue saliendo de tus planillas. Si generás montos sintéticos, destruís todo el argumento del proyecto.

**Revisá las preguntas generadas antes de usarlas.** Si el generador inventa una consulta sobre un impuesto que no existe y la usás como test, el equipo va a "corregir" el agente hacia una respuesta falsa. Descartá lo que no tenga sentido.

**No toques AutoScientist.** Es el otro producto de Adaption y automatiza el ciclo completo de entrenamiento y alineamiento de modelos. Es lo más interesante del catálogo y lo peor que podrías abrir un sábado a la mañana sin corpus armado.

**Práctico:** la documentación está en `docs.adaptionlabs.ai` — hay API, SDK de Python y app web, pero el flujo de documentos crudos va por la app, no por API. El acceso se activa desde el **portal del Buildathon**, no esperes un correo. **Timebox de una hora:** si se atasca, 60 preguntas escritas a mano valen más que 300 que nunca llegaron.

Con esto, la respuesta en el Q&A a "¿cómo saben que funciona?" pasa de "lo probamos y anda bien" a **"lo evaluamos contra 300 consultas que imitan cómo pregunta la gente real y acertamos en X%"**. Eso toca directo el 25% de ejecución técnica, y te habilita al challenge "Best use of Adaption".

## Sábado y domingo

### QA continuo

Cada versión nueva, corré tus 10 preguntas **desde la URL pública**, no desde la computadora de nadie:

| pregunta | ¿respondió bien? | ¿citó la norma correcta? | ¿el número es correcto? | observación |
|---|---|---|---|---|

Reportá por escrito y con la respuesta correcta al lado. "Está mal" no sirve; "dijo Bs 500 y según la RND X art. 3 son Bs 300" sí.

**Prestá atención especial a los números.** Un error de redacción se perdona; un monto equivocado en vivo hunde la demo.

### Tareas puntuales

- [ ] Escribir y ensayar el pitch
- [ ] Grabar el video de respaldo (~hora 21), con alguien manejando la app
- [ ] Explorar el Bolivia Data Track el sábado a la mañana: si algún equipo arma datos de PyMEs o actividad económica, se puede usar citando la fuente. **No comprometas la demo a un dataset ajeno.**
- [ ] Publicar el corpus como dataset (HuggingFace o GitHub) con fuentes, método, limitaciones y licencia CC BY 4.0. Es tu entregable con tu nombre y la mejor respuesta a "¿esto sobrevive al hackathon?"

### Tu trabajo más incómodo y más valioso

**A la hora 12, mirá el reloj y preguntá en voz alta: "¿ya se puede hacer la demo completa de punta a punta?"**

Si la respuesta es no, decilo fuerte y pedí que dejen de agregar cosas hasta que sí. Los que están metidos en el código nunca lo ven venir.

## El pitch — 4 minutos + 2 de preguntas

Escribilo desde el miércoles. Ensayalo cinco veces.

**1. El problema (45 s)** — Gran parte de la economía boliviana es informal, y uno de los motivos es que nadie entiende cómo formalizarse ni cuánto costaría. Contalo con una persona concreta, no con estadísticas.

**2. Demo en vivo (2 min)** — El caso de doña Carmen completo: la entrevista, el agente decidiendo y ejecutando herramientas en pantalla, y el cierre fuerte: **pedirle el número a un jurado y mandarle el calendario por WhatsApp en vivo**, que lo vea llegar a su celular. Si el envío falla, se pasa a la descarga del .ics sin drama y se sigue.

**3. Por qué esto no es un chatbot (45 s)** — Decide y usa cuatro herramientas. Los números salen de reglas verificables, no del modelo. Cada respuesta cita el artículo de donde sale.

**4. Cierre (30 s)** — Contadores, integración con el SIN, y el corpus publicado que queda disponible para cualquiera.

### Q&A: preparen respuestas para estas seis

- ¿Cómo evitan que invente montos?
- ¿De dónde salieron los datos y cómo saben que están vigentes?
- ¿Qué pasa cuando el SIN publica una resolución nueva?
- ¿Esto escala más allá del demo?
- ¿En qué se diferencia de preguntarle a ChatGPT?
- ¿Quién pagaría por esto?

---

# GABRIEL — Frontend

## Qué construís

Tres pantallas y un panel. La decisión de producto que manda sobre todo lo demás: **esto no es un chat con extras, es un flujo con un chat adentro.** Si se ve como ChatGPT con burbujas, la demo se lee como chatbot genérico y perdemos el 20% de "uso de IA y agentes".

## Las pantallas

**1. Inicio.** Una frase que explique qué hace, un botón grande de "Empezar", y **tres tarjetas con casos de ejemplo** (tienda de barrio, freelancer, productor agrícola) que precargan la conversación. Esas tarjetas son un truco de demo: en el pitch nadie tipea nada. Abajo, chico, el disclaimer: "Orientación informativa, no constituye asesoría fiscal."

**2. Entrevista.** Dos columnas. Izquierda, las preguntas de diagnóstico: **casi todo botones, no texto libre.** Actividad, tipo de clientes → botones. Ventas mensuales y capital → campos numéricos. Doña Carmen no redacta párrafos y vos no querés tipear frente al jurado. Derecha, el panel de tools.

**3. Resultado.** Arriba y grande, el régimen recomendado. Debajo, la justificación con el artículo citado y link a la fuente. Después el cálculo. Y al final la zona de entrega, que es el momento wow del pitch y tiene que ser lo más visible de la pantalla:

- Un campo de teléfono + botón **"Enviármelo por WhatsApp"** (lo más grande de la pantalla)
- **"Descargar calendario (.ics)"**
- **"Descargar checklist"**

El envío por WhatsApp necesita estado propio en la UI: enviando, enviado (con confirmación visible) y error. En la demo, ese "enviado" se muestra al mismo tiempo que llega el mensaje al celular, así que tiene que verse claro desde el fondo del salón.

## El panel de tools

Es lo que le demuestra al jurado que hay un agente decidiendo. Reglas:

- Siempre visible. Nunca detrás de un "ver detalles": si el jurado tiene que pedirlo, no cuenta.
- Cuatro estados por tool: en espera, ejecutando, listo, error.
- Cada tool muestra su nombre y un resultado corto (`buscar_normativa` → "Ley 843, art. 15").
- **Que se vean tardar un poco.** Si aparecen las cuatro instantáneamente el efecto se pierde. Un retardo escalonado hace que se lea como trabajo, no como animación.

## Cómo trabajar sin esperar al backend

Arrancá con datos falsos hardcodeados y armá todas las pantallas contra eso. Cuando el agente esté listo, se cambia la fuente de datos y ya. Si esperás al backend, perdés las primeras seis horas.

**Acordá el contrato de datos con Leonardo el miércoles** — la forma exacta del objeto que el backend te va a mandar. Una vez firmado, ninguno lo cambia sin avisar al otro.

**Los mocks no llegan a la demo.** Una sola línea o variable de entorno para cambiar entre `mock` y real, y se verifica antes del pitch.

## Lo que NO hay que construir

Login, sidebar de historial, modo oscuro, animaciones elaboradas, landing con secciones, app móvil. Nada de eso se evalúa. Mobile: que no se rompa, nada más — el pitch se hace en pantalla grande.

## Stack

Vite + React + TypeScript + Tailwind. Usá un template de chat como base y modificalo; no lo armes desde cero.

---

# LEANDRO — Backend: agente y RAG

## De qué respondés

Del cerebro: que el agente reciba una situación, decida qué herramienta usar, la ejecute y arme una respuesta que cite la norma.

## Paso cero — validar el proveedor (30 minutos, timebox estricto)

Antes de escribir una línea de lógica: `npx tsx scripts/smoke-test.ts`.

Contesta tres preguntas en orden y se detiene en la primera que falle:

1. ¿La key de fal vive y hay saldo?
2. **¿Devuelve un tool call bien formado con schema de Zod?** ← la que decide todo
3. ¿Se niega a inventar un monto que la tool no le dio?

Si la segunda falla y pasaron 30 minutos, **parás**: `LLM_PROVIDER=google` y seguís. Si falla la tercera, el modelo inventa números — no construyas encima de eso, es el riesgo número uno del proyecto.

## `buscar_normativa`

La primera tool y la base de todo. Retrieval sobre el corpus: recibe una pregunta, devuelve los pedazos más parecidos **con fuente y artículo**.

- Embeddings precomputados en un `embeddings.json` commiteado al repo. Sin base vectorial: el corpus es chico y cero infra = cero cosas que se rompen en la demo.
- Similitud coseno en memoria. Son seis líneas de código, no hace falta librería.
- **Probalo con 20 chunks antes de embeber todo.** Si el retrieval falla con 20, falla con 500, y mejor enterarse el miércoles.
- Guardá el nombre del modelo de embeddings dentro del JSON. Si alguien cambia la variable de entorno a la hora 14, querés que el código grite, no que devuelva basura en silencio.

**Aviso:** el mismo modelo de embeddings para indexar y para consultar. Si el índice se genera con uno y la consulta usa otro, los resultados son basura y no lanza ningún error.

## Jueves — El loop del agente

Vercel AI SDK (`streamText` con `tools`), tool calling declarativo con Zod.

- Empezá con una sola tool conectada y andá sumando.
- **El system prompt tiene que prohibir explícitamente inventar números.** Todo monto y toda fecha salen de las tools; si una tool no lo devolvió, el agente dice que no lo tiene.
- El agente debe citar artículo y fuente en cada afirmación normativa.
- Emitir eventos de tool call hacia el frontend para que Gabriel pinte el panel. Coordinalo con él el miércoles.

## Viernes — End-to-end

Pregunta → retrieval → decisión → tool → respuesta con cita. Feo pero funcionando. Si esto anda el viernes, el sábado es puro pulido.

## Durante el evento

- Horas 2-6: RAG end-to-end con el corpus completo
- Horas 6-11: las cinco tools conectadas al loop (las cuatro base + `enviar_recordatorio`)
- Manejo de errores: si una tool falla, el agente lo dice, no improvisa

**Si sobra tiempo (y solo entonces):** vigilancia normativa con Firecrawl — detectar RND nuevas en el portal del SIN y avisar a quién le cambia la obligación. Es lo primero que se recorta si vamos justos.

---

# LEONARDO — Backend: tools determinísticas y exportables

## De qué respondés

De las tres herramientas que **no usan IA**: son if/else y aritmética. Esa es una ventaja para el pitch — "el agente razona con IA pero calcula con reglas verificables" — pero solo si de verdad no pasan por el modelo.

Todos los datos que necesitás salen de las planillas de Fernanda. **No copies un solo monto de tu memoria ni de una respuesta de IA.**

## Las tres tools

**`clasificar_regimen(actividad, capital, ventas_anuales, tipo_clientes)`**
Devuelve el régimen y **por qué**, citando la norma que lo respalda. Lógica pura. Contemplá el caso borde: qué pasa si está justo en el límite, y qué pasa si no encaja en ninguno.

**`calcular_impuestos(regimen, ventas_mensuales)`**
IVA, IT e IUE para el General; cuota fija por categoría para el Simplificado. Los porcentajes y las cuotas salen de las planillas 1 y 2 de Fernanda, no de tu cabeza.

**`generar_calendario(regimen, ultimo_digito_nit)`**
Fechas de vencimiento del año según la planilla 3. Devuelve un .ics válido. Usá la librería `ics` de npm; no armes el formato a mano.

## La quinta tool — `enviar_recordatorio(telefono, calendario)`

Esta es nuestra jugada fuerte y usa un sponsor confirmado (**Zavu**, mensajería multicanal).

Doña Carmen no va a volver a la web para ver cuándo vence su cuota, pero WhatsApp lo tiene abierto todo el día. Con esto el producto deja de ser una consulta puntual y pasa a acompañar al usuario: le llega el calendario al WhatsApp y después el aviso antes de cada vencimiento.

En el pitch: **le mandamos el calendario al WhatsApp de un jurado en vivo y lo ve llegar a su celular.** Eso responde solo la pregunta de si el proyecto sobrevive al hackathon.

Lo que hay que hacer:

- [ ] Alta en Zavu y **un envío de prueba real el viernes**, a un número del equipo. No el domingo.
- [ ] Mensaje corto y claro: régimen, próximo vencimiento, y el archivo o link del calendario.
- [ ] Validar el formato del número boliviano antes de enviar (con código de país).
- [ ] Manejo de error visible: si el envío falla, la UI lo dice y ofrece la descarga. **Nunca simular un envío exitoso.**
- [ ] Guardar el número solo lo necesario para enviar. Nada de base de datos de usuarios.

**Plan B si Zavu falla en la demo:** los botones de descarga siguen ahí y la demo continúa. Ensayen esa transición.

## Cómo escribirlas

Como funciones puras de TypeScript, **antes de conectarlas al agente**. Recibís argumentos, devolvés un objeto. Sin LLM de por medio.

Escribí una tabla de casos a mano y verificá cada uno contra las planillas de Fernanda: entrada → salida esperada. Cuando las tres pasen, se conectan al loop de Leandro.

## Miércoles — El contrato de datos

Tu primera tarea, antes de escribir lógica: **acordar con Gabriel la forma exacta del objeto que le vas a mandar.** Régimen, justificación con artículo y link, desglose del cálculo, lista de fechas, estado de cada tool. Escríbanlo en un archivo del repo y no lo cambien sin avisar.

Eso desbloquea a Gabriel para trabajar en paralelo con datos falsos.

## Los exportables

El .ics y el checklist son el momento wow. Dos cosas que suelen fallar y hay que probar temprano:

- **Que el .ics abra de verdad en Google Calendar.** Probalo el viernes, no el domingo. Un .ics mal formado se descarga bien y no importa nada.
- **Que el nombre del archivo tenga sentido** (`calendario-fiscal-2026.ics`), porque en la demo se ve.

## Orden de recorte si falta tiempo

Primero cae `calcular_impuestos`, después el checklist en PDF. `generar_calendario`, `clasificar_regimen` y `enviar_recordatorio` NO se negocian.

---

# COORDINACIÓN — Repo, deploy e integración

## Antes del evento

- [ ] Nombre decidido y repo creado, público, con description
- [ ] Los cuatro invitados como colaboradores y con la invitación **aceptada**
- [ ] `.gitignore` de Node verificado: `node_modules` y `.env*` excluidos
- [ ] Licencia MIT en el código
- [ ] Deploy en Vercel con URL pública viva, probada desde el celular con datos móviles
- [ ] `.env.example` commiteado con los nombres de las variables, sin valores
- [ ] Estructura de carpetas creada: `/corpus`, `/scripts`, `/lib/tools`
- [ ] Script de ingesta corrido y `embeddings.json` commiteado

- [ ] **Créditos de fal.ai activados y `scripts/smoke-test.ts` en verde** — anotar cuánto crédito dieron, la página de sponsors no lo dice
- [ ] Key de Gemini de AI Studio sacada como plan B, aunque no se use (no pide tarjeta, tarda dos minutos)
- [ ] Revisar "Mis créditos" en el portal privado: varios sponsors entregan por código compartido que hay que revelar ahí — incluidos **Firecrawl y Exa**, que ahora son parte del armado del corpus
- [ ] **Activar Adaption desde el portal** — el acceso vive ahí, no llega por correo
- [ ] Cuenta de Zavu dada de alta y con un envío de prueba real hecho

## Durante el evento

- [ ] Activar los códigos de sponsors en el kickoff (Cursor Pro, Exa, Firecrawl)
- [ ] API keys cargadas como variables de entorno en Vercel, nunca en el repo
- [ ] Re-deploy y verificación de la URL en las primeras dos horas
- [ ] README de menos de 5 pasos, horas 18-20 — **es entregable obligatorio**
- [ ] Un extraño tiene que poder clonar el repo y correrlo
- [ ] Hotspot del celular probado antes, por si el wifi del venue falla

## Riesgos y planes B

| Riesgo | Plan B |
|---|---|
| El LLM se cae en la demo | Video de respaldo grabado a la hora 21 (no reemplaza la demo en vivo, pero salva el momento) |
| El wifi del venue falla | Hotspot del celular, probado antes |
| El agente alucina un monto | Todo número sale de las tools determinísticas. Decirlo en el pitch suma puntos |
| Se acaba el tiempo | Orden de recorte: calculadora, después checklist. Calendario y clasificación no se tocan |
| Se rompe algo a último momento | Laptop de respaldo con el repo clonado y el `.env` cargado, probada el viernes |
| **Se acaban los créditos de fal** | `LLM_PROVIDER=google` — capa gratuita, sin tarjeta. Una variable de entorno, no un refactor |
| **Gemini también se agota** | Recién ahí, cargar saldo con tarjeta, en un proyecto **separado** del que usa la capa gratuita |
| **Indexar y consultar con distinto modelo de embeddings** | El id queda estampado en `embeddings.json` y se verifica al arrancar. Sin eso el bug no lanza error: solo devuelve basura |
| **El WhatsApp no llega en la demo** | Los botones de descarga siguen ahí; ensayar la transición sin que se note el bache |

---

## Recordatorio final para todos

Escribir el código es la parte que la IA hace rápido. Lo que no hace sola: verificar que los datos sean ciertos, decidir qué se ve en pantalla, y contar en cuatro minutos por qué esto le importa a alguien.

Eso lo hacen ustedes, y es donde se gana.
