// src/services/azureAuth.js
// Pseudocódigo / esqueleto. Adaptalo a tu MSAL u oauth2-client.
const { ConfidentialClientApplication, LogLevel } = require('@azure/msal-node')

const config = {
  auth: {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.AZURE_CLIENT_ID, // usa tus vars correctas
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
  system: { loggerOptions: { loggerCallback() {}, logLevel: LogLevel.Verbose, piiLoggingEnabled: false } },
}

const cca = new ConfidentialClientApplication(config)

const REDIRECT_URI = process.env.AZURE_REDIRECT_URI || 'http://localhost:4000/api/auth/callback'
const SCOPES = ['user.read', 'profile', 'email', 'openid', 'offline_access']

exports.getAuthUrl = async () => {
  const params = {
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
  }
  return await cca.getAuthCodeUrl(params)
}

exports.exchangeCodeForToken = async (code, req) => {
  const tokenRequest = {
    code,
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
  }
  const response = await cca.acquireTokenByCode(tokenRequest)
  // `response.idTokenClaims` trae datos del usuario
  return {
    accessToken: response.accessToken,
    idToken: response.idToken,
    refreshToken: response.refreshToken, // depende de flujo
    profile: response.idTokenClaims || {},
  }
}
