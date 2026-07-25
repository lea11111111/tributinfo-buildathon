# TODO Leonardo — tareas manuales (lo que la IA no puede hacer por vos)

Estado del código al sábado 10:30: las 4 tools están escritas, tipadas y probadas
(`npm run test:tools` pasa). Lo que falta es **todo lo de abajo**, en este orden.

**Todo este backend vive en `backend/`**. El frontend de Gabriel está en `client/`
(Vite + React). Comandos `npm run ...` se corren desde `backend/`.

Para conectar frontend ↔ backend en local:
```bash
# Terminal 1
cd backend && npm run dev          # API en http://localhost:3001

# Terminal 2
cd client && pnpm install && pnpm dev   # UI en http://localhost:5173
```
En `client/.env`: `VITE_DATA_SOURCE=real` y `VITE_API_URL=http://localhost:3001`

Contrato firmado: `docs/contrato-datos.md` y `client/src/lib/types.ts`.
El adapter que lo implementa: `backend/lib/adapters/diagnosis.ts`.

---

## 1. Zavu (URGENTE — es el momento wow del pitch)

- [ ] **Alta en Zavu**: portal del Buildathon → "Mis créditos" → revelar el código de Zavu.
- [ ] Sacar la **API key** del dashboard de Zavu.
- [ ] Crear `backend/.env` (copiar de `backend/.env.example`) y pegar:
  ```
  ZAVU_API_KEY=tu_key
  TEST_PHONE=+591XXXXXXXX   (tu celular o el de alguien del equipo)
  ```
- [ ] Correr el envío de prueba real: `npm run test:zavu`
- [ ] Verificar que el WhatsApp **llegue de verdad** al celular.

### ⚠️ Trampas de Zavu que encontré en su documentación (leelas antes de la demo)

1. **Ventana de 24 horas de WhatsApp**: solo podés mandar mensajes libres si el
   destinatario le escribió primero al número de Zavu. Para iniciar conversación
   en frío (p. ej. el celular de un jurado) hay dos opciones:
   - **Opción A (fácil, para la demo):** que el jurado le mande "hola" al número
     de Zavu primero, y ahí le enviás. Ensayá este flujo.
   - **Opción B (robusta):** crear un **template preaprobado** en el dashboard de
     Zavu hoy (la aprobación puede tardar). El código ya soporta templates:
     pasale `templateId` a `enviarWhatsApp()` en `lib/utils/zavu.ts`.
2. **URLs bloqueadas**: si el mensaje lleva un link no verificado, Zavu lo
   bloquea con error `url_not_verified`. Hay que registrar el dominio de la app
   (la URL de Vercel) vía su endpoint `/v1/urls` o el dashboard. **Hacelo apenas
   tengan la URL de producción**, o mandá el mensaje sin link.
3. **Límite de 200 mensajes/día** sin KYC. Alcanza para la demo, pero no gasten
   mensajes a lo loco en pruebas.

## 2. Planillas de Fernanda (bloqueante para tener números reales)

Todos los montos en `lib/data/` son **PLACEHOLDER inventados** para que el código
corra. La demo NO puede salir con esos números.

- [ ] Pedirle a Fernanda las planillas 1–4 (aunque estén incompletas).
- [ ] Reemplazar los valores en:
  - `lib/data/categorias-simplificado.ts` — planilla 1 (categorías RTS)
  - `lib/data/impuestos-general.ts` — planilla 2 (alícuotas IVA/IT/IUE)
  - `lib/data/calendario-vencimientos.ts` — planilla 3 (día por dígito de NIT + meses de pago por régimen)
  - `lib/data/checklist-nit.ts` — planilla 4 (pasos de inscripción)
- [ ] Completar cada `FUENTE_PENDIENTE` con norma, artículo y link reales.
- [ ] Confirmar con Fernanda el caso borde: ¿el tope de capital de cada categoría es inclusivo?
- [ ] Cuando TODO esté copiado y verificado: poner `DATOS_VERIFICADOS = true`
  en `lib/data/verificacion.ts` (eso apaga las advertencias en los outputs).
- [ ] Volver a correr `npm run test:tools` y ajustar los casos esperados si los
  topes reales cambian los resultados.

## 3. Probar el .ics en Google Calendar (5 min, no lo dejes para el domingo)

- [ ] `npm run test:tools` genera `scripts/out/calendario-fiscal-2026.ics`.
- [ ] Importalo en Google Calendar (Configuración → Importar y exportar) y
  verificá que los eventos aparecen con título, fecha y recordatorio.

## 3.5 Google Calendar / servidor MCP (nuevo — solo vos podés hacer esto)

El código ya está: cada evento del calendario trae un link "Añadir a Google Calendar"
(sin OAuth, no puede fallar en la demo) y hay un servidor MCP en `backend/mcp/` con
las tools `generar_calendario_fiscal` y `agregar_a_google_calendar`. Lo que falta
son las credenciales y el registro, que son manuales:

- [ ] **Probar un link de la capa demo** (2 min, sin credenciales): correr
  `npm run test:tools`, copiar cualquier `googleCalendarUrl` de un evento
  (también sale en la respuesta de `POST /api/diagnose`) y abrirlo en el
  navegador logueado en Google → debe abrir Google Calendar con el evento precargado.
- [ ] **Registrar el MCP en Cursor**: copiar el bloque de `backend/mcp/README.md`
  a `.cursor/mcp.json` y verificar que las tools aparecen en el cliente.
- [ ] **Credenciales de Google** (solo para la tool `agregar_a_google_calendar`,
  paso a paso completo en `backend/mcp/README.md`):
  - [ ] Crear proyecto en Google Cloud Console.
  - [ ] Habilitar **Google Calendar API**.
  - [ ] Configurar pantalla de consentimiento OAuth (tipo Externo) y agregarte
    como usuario de prueba.
  - [ ] Crear credenciales OAuth (app web, redirect a OAuth Playground) →
    Client ID + Client Secret.
  - [ ] Obtener el **refresh token** en OAuth Playground con el scope
    `calendar.events` (ojo: en modo "pruebas" vence a los 7 días — sacalo cerca de la demo).
  - [ ] Pegar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REFRESH_TOKEN`
    en `backend/.env` (nunca al repo).
- [ ] **Probar la tool real**: desde el cliente MCP pedir "agregá mi calendario
  fiscal a Google Calendar" y verificar que los eventos aparecen en tu calendario.
- [ ] Sin credenciales la tool devuelve error y sugiere los links (nunca simula
  éxito) — ese es el fallback ensayado para la demo. El .ics sigue siendo el plan B.
- [ ] **Avisarle a Gabriel**: el contrato ganó un campo opcional `googleCalendarUrl`
  por evento (ver `docs/contrato-datos.md`, sección "Adición opcional"). Su frontend
  actual no se rompe (campo opcional); si quiere, puede renderizar un botón por evento.

## 4. Sincronización con el equipo

- [ ] **Gabriel**: mostrale `lib/types/resultado.ts` — es el contrato de datos.
  Que confirme o pida cambios HOY. Una vez firmado, no se cambia sin avisar.
  Sus endpoints listos: `POST /api/whatsapp` y `GET /api/descargar-calendario?regimen=X&digito=N`.
- [ ] **Leandro**: pasale `lib/tools/index.ts` — ahí están las 4 tools exportadas
  con sus tipos de input, listas para envolver en schemas de Zod del agente.
- [ ] **Coordinación/merge**: el frontend de Gabriel vive en su propia carpeta
  (p. ej. `frontend/`). Las rutas en `backend/app/api/` usan Request/Response
  estándar (compatible con Next.js App Router), así que si en algún momento se
  copian dentro del Next.js de Gabriel funcionan tal cual. Si en cambio el
  backend se despliega aparte (API separada), avisar al equipo cómo se expone
  (puerto, framework — hoy son funciones sueltas + `Request/Response`, no un
  server corriendo). Al unificar `package.json` con el de Gabriel: conservar
  `ics`, `tsx`, `dotenv` y los scripts `test:tools` / `test:zavu`.

## 5. Vercel (cuando haya deploy)

- [ ] Cargar `ZAVU_API_KEY` en las variables de entorno de Vercel (nunca al repo).
- [ ] Cargar `NEXT_PUBLIC_APP_URL` con la URL pública (para el link del .ics en el WhatsApp).
- [ ] Registrar esa URL en Zavu (ver trampa 2 de arriba).

## 6. Ensayo del Plan B (antes del pitch)

- [ ] Simular fallo de Zavu (quitar la key en local) y verificar que la UI
  muestra el error y ofrece la descarga del .ics sin trabarse.
- [ ] Ensayar la transición en vivo: "no llegó el WhatsApp → descargamos el .ics"
  sin que se note el bache.

---

## Qué ya está hecho (no lo repitas)

| Pieza | Archivo | Estado |
|---|---|---|
| Contrato de datos | `lib/types/resultado.ts` | Listo, falta OK de Gabriel |
| Inputs de tools | `lib/types/tools.ts` | Listo |
| `clasificar_regimen` | `lib/tools/clasificar-regimen.ts` | Listo, datos placeholder |
| `calcular_impuestos` | `lib/tools/calcular-impuestos.ts` | Listo, datos placeholder |
| `generar_calendario` (.ics) | `lib/tools/generar-calendario.ts` | Listo, probado |
| `enviar_recordatorio` | `lib/tools/enviar-recordatorio.ts` | Listo, falta key de Zavu |
| Cliente Zavu | `lib/utils/zavu.ts` | Listo (maneja 24h window y URL bloqueada) |
| Validación teléfono BO | `lib/utils/validar-telefono.ts` | Listo, probado |
| API WhatsApp | `app/api/whatsapp/route.ts` | Listo |
| API descarga .ics | `app/api/descargar-calendario/route.ts` | Listo |
| Links "Añadir a Google Calendar" | `lib/utils/google-calendar-link.ts` | Listo, probado (sin OAuth) |
| Servidor MCP (2 tools) | `mcp/server.ts` (`npm run mcp`) | Listo, faltan credenciales de Google |
| Tests de tools | `scripts/test-tools.ts` | 30 casos, todos pasan |
| Test envío real | `scripts/test-zavu.ts` | Listo para correr con key |

Comandos útiles (correr desde `backend/`):

```
cd backend
npm run test:tools   # prueba las tools sin red
npm run test:zavu    # envío real de WhatsApp (necesita .env)
npm run typecheck    # verificación de tipos
```
