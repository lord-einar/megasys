// ============================================
// backend/src/config/auth.js
// ============================================
const msal = require('@azure/msal-node');
require('dotenv').config();

// Configuración de MSAL para Azure AD
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        if (!containsPii) {
          console.log(message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Info
    }
  }
};

// Crear instancia de aplicación confidencial
const confidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);

// Configuración de scopes
const SCOPES = ['user.read', 'profile', 'email', 'openid'];

// URLs de redirección
const REDIRECT_URI = process.env.AZURE_REDIRECT_URI || 'http://localhost:4000/api/auth/callback';

module.exports = {
  msalConfig,
  confidentialClientApplication,
  SCOPES,
  REDIRECT_URI
};