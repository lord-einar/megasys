const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, attachments }) => {
  let transporter = nodemailer.createTransport({
    host: 'germanojeda.ar', // Reemplaza con tu servidor SMTP
    port: 465,
    secure: true, // true para 465, false para otros puertos
    auth: {
      user: 'remitos@germanojeda.ar', // Reemplaza con tu usuario SMTP
      pass: 'Italia2025!', // Reemplaza con tu contraseña SMTP
    },
    tls: {
      rejectUnauthorized: false // Desactiva la verificación del certificado SSL
    }
  });

  let info = await transporter.sendMail({
    from: '"Remitos" <remitos@germanojeda.ar>', // Remitente
    to, // Lista de destinatarios
    subject, // Asunto
    text, // Cuerpo del correo en texto plano
    attachments, // Adjuntos
  });

  console.log('Mensaje enviado: %s', info.messageId);
};

module.exports = sendEmail;
