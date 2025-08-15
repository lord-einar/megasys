// ============================================
// backend/src/config/email.js
// ============================================
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter de Nodemailer para Office 365
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
};

// Verificar conexión
const verifyEmailConnection = async () => {
  const transporter = createEmailTransporter();
  try {
    await transporter.verify();
    console.log('✅ Conexión con servidor de email establecida');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con servidor de email:', error);
    return false;
  }
};

module.exports = {
  createEmailTransporter,
  verifyEmailConnection
};
