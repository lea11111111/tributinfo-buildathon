# Servidor MCP de TributInfo

Servidor [MCP](https://modelcontextprotocol.io) por stdio que expone las tools tributarias
a Cursor, Claude Desktop o cualquier cliente MCP.

## Tools

| Tool | Qué hace | Necesita credenciales |
|---|---|---|
| `generar_calendario_fiscal` | Calendario de vencimientos + links "Añadir a Google Calendar" | No |
| `agregar_a_google_calendar` | Crea los eventos directamente en tu Google Calendar (API oficial) | Sí (OAuth2) |

Correr a mano (para probar que arranca): `pnpm --filter tributinfo-backend mcp`

## Registrar en Cursor / Claude Desktop

Cursor: `.cursor/mcp.json` (ya está creado en este repo, apunta a esta máquina).
Claude Desktop: `claude_desktop_config.json`. El bloque es el mismo:

```json
{
  "mcpServers": {
    "tributinfo": {
      "command": "C:/Users/Usuario/Desktop/Proyectos/CursorBuildathon/backend/node_modules/.bin/tsx.cmd",
      "args": ["C:/Users/Usuario/Desktop/Proyectos/CursorBuildathon/backend/mcp/server.ts"]
    }
  }
}
```

**Por qué el binario de `tsx.cmd` y no `npx tsx`:** en Windows, `child_process.spawn`
sin `shell: true` falla con `ENOENT` al intentar ejecutar `npx` (no es un `.exe`,
es un `.cmd`, y sin el shell Node no lo resuelve). No todos los clientes MCP spawnean
con shell, así que apuntar directo al binario de `tsx` dentro de `node_modules/.bin/`
evita el problema por completo. Si migran a Mac/Linux, `npx tsx <ruta>` sí funciona.

Las variables de entorno se leen de `backend/.env` automáticamente (el server resuelve
la ruta solo, no importa desde dónde lo spawnee el cliente). También podés pasarlas
con el campo `"env"` del mcp.json si preferís.

## Variables de entorno (en `backend/.env`, NUNCA al repo)

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=primary   # opcional, default: calendario principal
```

Sin estas variables, `agregar_a_google_calendar` devuelve un error claro (no simula éxito)
y sugiere usar los links de `generar_calendario_fiscal` como fallback.

## Cómo obtener las credenciales de Google (una sola vez)

1. **Proyecto**: entrar a [Google Cloud Console](https://console.cloud.google.com/) →
   crear proyecto (p. ej. "tributinfo").
2. **Habilitar la API**: "APIs y servicios" → "Biblioteca" → buscar **Google Calendar API** → Habilitar.
3. **Pantalla de consentimiento OAuth**: "APIs y servicios" → "Pantalla de consentimiento" →
   tipo **Externo** → completar nombre y correo → en "Usuarios de prueba" agregar tu propio Gmail
   (con eso alcanza, no hace falta publicar la app).
4. **Credenciales OAuth**: "Credenciales" → "Crear credenciales" → "ID de cliente de OAuth" →
   tipo **Aplicación web** → agregar `https://developers.google.com/oauthplayground` como
   URI de redirección autorizado. Copiar el **Client ID** y el **Client Secret**.
5. **Refresh token** (vía [OAuth Playground](https://developers.google.com/oauthplayground)):
   - Engranaje (arriba a la derecha) → marcar "Use your own OAuth credentials" → pegar Client ID y Secret.
   - En el paso 1, buscar "Calendar API v3" y marcar el scope
     `https://www.googleapis.com/auth/calendar.events` → "Authorize APIs" → iniciar sesión
     con el Gmail que agregaste como usuario de prueba.
   - En el paso 2, "Exchange authorization code for tokens" → copiar el **Refresh token**.
6. Pegar los tres valores en `backend/.env` y probar la tool desde el cliente MCP.

> Nota: como la app OAuth queda "en pruebas", el refresh token vence a los 7 días.
> Para la demo alcanza de sobra; si venciera, repetir el paso 5 (2 minutos).
