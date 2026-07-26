# Servidor MCP de TributInfo

Servidor [MCP](https://modelcontextprotocol.io) por stdio que expone tools de calendario
a Cursor (o cualquier cliente MCP).

## Tools

| Tool | Qué hace | Credenciales |
|---|---|---|
| `generar_calendario_fiscal` | Vencimientos + links “Añadir a Google Calendar” | No |
| `agregar_a_google_calendar` | Crea eventos en Google Calendar vía API | OAuth2 |

Arranque manual:

```bash
pnpm --filter tributinfo-backend mcp
```

## Registrar en Cursor

Archivo `.cursor/mcp.json` (rutas absolutas de esta máquina; no se commitea):

```json
{
  "mcpServers": {
    "tributinfo": {
      "command": "C:/Users/Usuario/Desktop/Proyectos/CursorBuildathon/backend/node_modules/.bin/tsx.cmd",
      "args": [
        "C:/Users/Usuario/Desktop/Proyectos/CursorBuildathon/backend/mcp/server.ts"
      ]
    }
  }
}
```

En Windows conviene apuntar al `tsx.cmd` de `node_modules/.bin` (evitar `npx` sin shell).
En Mac/Linux: `npx tsx <ruta-al-server.ts>`.

Las variables se leen de `backend/.env`.

## Variables (solo para `agregar_a_google_calendar`)

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=primary
```

Sin ellas, esa tool falla con mensaje claro; `generar_calendario_fiscal` sigue funcionando con los links TEMPLATE.

## Obtener credenciales Google (una vez)

1. [Google Cloud Console](https://console.cloud.google.com/) → proyecto nuevo.
2. Habilitar **Google Calendar API**.
3. Pantalla de consentimiento OAuth (Externo) + tu Gmail como usuario de prueba.
4. Credenciales → ID de cliente OAuth (aplicación web) con redirect
   `https://developers.google.com/oauthplayground`.
5. En [OAuth Playground](https://developers.google.com/oauthplayground): scope
   `https://www.googleapis.com/auth/calendar.events` → refresh token.
6. Pegar valores en `backend/.env` y probar desde Cursor.

> App en “pruebas”: el refresh token puede vencer a los 7 días; regenerarlo es el paso 5.
