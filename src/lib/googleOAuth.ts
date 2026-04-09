/** Client ID do Google Cloud (OAuth 2.0 Web). Vazio = botão Google visível porém desativado (evita crash do SDK). */
export const GOOGLE_OAUTH_CLIENT_ID = String(
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
).trim()

export const isGoogleOAuthConfigured = GOOGLE_OAUTH_CLIENT_ID.length > 0
