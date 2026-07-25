# Guía: template de WhatsApp preaprobado en Zavu (TributInfo)

Investigado en docs.zavu.dev el sábado del hackathon. Lo confirmado en la doc
está marcado; el resto es práctica estándar de WhatsApp Business API.

## Por qué lo necesitamos

WhatsApp solo permite mensajes libres dentro de la ventana de 24h (el
destinatario nos escribió primero). Para escribirle en frío al celular de un
jurado hace falta un template aprobado por Meta.

## 0. Prerequisito: sender con WhatsApp Business conectado (30-45 min)

Zavu NO da número compartido: hay que conectar una WhatsApp Business Account
(WABA) al sender.

1. Dashboard: https://dashboard.zavu.dev → tu **Sender Profile**
2. Pestaña **Channels** → WhatsApp → **Add**
3. Elegir **"Connect a Zavu phone number"** (recomendado; el primer número de
   EE.UU. es gratis por equipo)
4. Se abre el embedded signup de Meta (requiere cuenta de Facebook Business)
5. Verificación por **Call (no SMS)** — obligatorio con números de Zavu; el
   código de la llamada aparece en el dashboard de Zavu
6. El sender queda **Active** con WhatsApp habilitado

Sin KYC el límite es 200 mensajes/día por canal — sobra para la demo.

## 1. Crear el template en el dashboard

1. **Senders** → seleccionar el sender con WhatsApp
2. Pestaña **Templates** → **Create Template**
3. Campos: Name (minúsculas y guiones bajos), Language `es`, Category,
   Body (variables `{{1}}`...), opcionales Header/Footer/Buttons (máx. 3)
4. Queda en `draft` → menú **"…"** → **Submit for Approval** → `pending` → `approved`
5. El `templateId` se genera al crear (formato `tmpl_...` o `tpl_...` según la
   página de la doc — copiar el ID exacto del dashboard o de `GET /v1/templates`)

## 2. Template sugerido (copiar/pegar)

- **Name:** `resumen_fiscal_tributinfo`
- **Language:** `es`
- **Category:** `UTILITY` (aprobación "Fast (hours)"; MARKETING tarda días)
- **Body:**

```
Hola, soy TributInfo, tu asistente tributario. Te comparto tu resumen fiscal solicitado: tu régimen tributario es {{1}}. Tu próximo vencimiento es el {{2}}, correspondiente a {{3}}. Puedes consultar tu calendario fiscal completo con el botón de abajo.
```

- **Footer:** `TributInfo · Información tributaria personalizada`
- **Botón:** tipo `url`, texto "Ver calendario", URL **estática** de la app

Reglas que evitan rechazos (confirmadas en la doc):
- El body NO puede empezar (ni conviene que termine) con una variable
- Nada de lenguaje promocional en un template UTILITY (rechazo por category mismatch)
- Botones URL dinámicos solo aceptan `{{1}}` posicional; mejor URL estática
- No usar acortadores de URL (bit.ly, etc.)

**Truco:** enviar DOS variantes en paralelo con nombres distintos (una con botón,
otra con el link como texto plano en el body). La que apruebe primero, se usa.

## 3. Tiempos y monitoreo

- Doc oficial: 24-48h típico, pero UTILITY suele aprobar en minutos/horas
- **Enviarlo a aprobación YA** (sábado); no está garantizado para el domingo 08:30
- Webhook: Senders → sender → Webhooks → evento `template.status_changed`
- Polling: `GET https://api.zavu.dev/v1/templates/{templateId}` → `status` / `rejectionReason`
- Si rechaza: leer `rejectionReason`, editar (vuelve a `draft`) y reenviar, sin penalidad
- OJO: editar un template aprobado lo devuelve a `draft`

## 4. Envío por API una vez aprobado

```bash
curl -X POST https://api.zavu.dev/v1/messages \
  -H "Authorization: Bearer $ZAVU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+59170000000",
    "channel": "whatsapp",
    "messageType": "template",
    "content": {
      "templateId": "tmpl_abc123",
      "templateVariables": {
        "1": "Régimen Simplificado",
        "2": "15 de agosto de 2026",
        "3": "Cuota bimestral RTS"
      }
    }
  }'
```

- Pasar TODAS las variables (si falta una: error `#100 INVALID_PARAMETER`)
- Con más de un sender: header `Zavu-Sender: <senderId>`
- Nuestro código ya lo soporta: `enviarWhatsApp({ templateId, templateVariables })`
  en `lib/utils/zavu.ts`
- Probar primero contra un número del equipo, no el del jurado

## 5. Plan B si no aprueba a tiempo

1. **Que el jurado escriba primero:** mostrar QR `wa.me/<numero>` en una slide,
   el jurado manda "hola" → se abre la ventana de 24h → mensaje libre normal
2. Zavu tiene endpoint de introspección de número que dice si la ventana está
   abierta (útil para decidir template vs mensaje libre automáticamente)
3. Ensayar el flujo completo el sábado a la noche con un celular del equipo
4. Dejar el camino del "hola" preparado aunque el template apruebe — doble seguro

## Jugada de hoy (sábado)

1. Conectar sender con WABA ahora (30-45 min)
2. Crear y someter las 2 variantes del template UTILITY
3. Activar webhook `template.status_changed`
4. Ensayar plan B del "hola"
