// ============================================
// backend/src/services/emailService.js
// ============================================
const fs = require('fs').promises;
const path = require('path');
const { createEmailTransporter } = require('../config/email');
const { logger } = require('../utils/logger');
const { formatDateTimeES, getDaysDifference } = require('../utils/helpers');

class EmailService {
  constructor() {
    this.transporter = createEmailTransporter();
  }
  
  /**
   * Enviar email genérico
   */
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@company.com',
        to,
        subject,
        html,
        attachments
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email enviado a ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error enviando email a ${to}:`, error);
      throw error;
    }
  }
  
  /**
   * Enviar notificación de remito creado
   */
  async sendRemitoCreado(remito, tecnico) {
    try {
      const template = await this.loadTemplate('remitoCreado');
      
      const html = template
        .replace('{{tecnico_nombre}}', `${tecnico.nombre} ${tecnico.apellido}`)
        .replace('{{numero_remito}}', remito.numero_remito)
        .replace('{{sede_origen}}', remito.sede_origen.nombre_sede)
        .replace('{{sede_destino}}', remito.sede_destino.nombre_sede)
        .replace('{{fecha}}', formatDateTimeES(remito.fecha))
        .replace('{{url_sistema}}', process.env.FRONTEND_URL);
      
      await this.sendEmail(
        tecnico.email,
        `Nuevo remito asignado: ${remito.numero_remito}`,
        html
      );
    } catch (error) {
      logger.error('Error enviando notificación de remito:', error);
      throw error;
    }
  }
  
  /**
   * Enviar solicitud de confirmación de remito
   */
  async sendConfirmacionRemito(remito, solicitante) {
    try {
      const template = await this.loadTemplate('remitoConfirmacion');
      
      const baseApi = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
      const confirmUrl = `${baseApi}/api/remitos/confirmar/${remito.token_confirmacion}`;
      
      const html = template
        .replace('{{solicitante_nombre}}', `${solicitante.nombre} ${solicitante.apellido}`)
        .replace('{{numero_remito}}', remito.numero_remito)
        .replace('{{fecha_entrega}}', formatDateTimeES(remito.fecha_entrega))
        .replace('{{confirm_url}}', confirmUrl)
        .replace('{{url_sistema}}', process.env.FRONTEND_URL);
      
      await this.sendEmail(
        solicitante.email,
        `Confirmación de recepción - Remito ${remito.numero_remito}`,
        html
      );
    } catch (error) {
      logger.error('Error enviando confirmación de remito:', error);
      throw error;
    }
  }
  
  /**
   * Enviar recordatorio de préstamo por vencer
   */
 async sendPrestamoVencimiento(prestamo, usuario) {
  try {
    const template = await this.loadTemplate('prestamoVencimiento');
    const diasRestantes = getDaysDifference(new Date(), prestamo.fecha_devolucion);
    
    const html = template
      .replace(/\{\{usuario_nombre\}\}/g, `${usuario.nombre} ${usuario.apellido}`)
      .replace(/\{\{item_descripcion\}\}/g, `${prestamo.tipo.nombre} - ${prestamo.marca} ${prestamo.modelo}`)
      .replace(/\{\{service_tag\}\}/g, prestamo.service_tag)
      .replace(/\{\{fecha_vencimiento\}\}/g, formatDateTimeES(prestamo.fecha_devolucion))
      .replace(/\{\{fecha_prestamo\}\}/g, formatDateTimeES(prestamo.created_at))
      .replace(/\{\{dias_restantes\}\}/g, String(diasRestantes))
      .replace(/\{\{item_id\}\}/g, String(prestamo.id))
      .replace(/\{\{url_sistema\}\}/g, process.env.FRONTEND_URL || '#');
    
    await this.sendEmail(
      usuario.email,
      `Recordatorio: Préstamo por vencer - ${prestamo.service_tag}`,
      html
    );
  } catch (error) {
    logger.error('Error enviando recordatorio de préstamo:', error);
    throw error;
  }
}

  
  /**
   * Cargar template de email
   */
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
      const template = await fs.readFile(templatePath, 'utf-8');
      
      // Cargar template base y reemplazar contenido
      const basePath = path.join(__dirname, '..', 'templates', 'email', 'base.html');
      const baseTemplate = await fs.readFile(basePath, 'utf-8');
      
      return baseTemplate
        .replace(/\{\{content\}\}/g, template)
        .replace(/\{\{url_sistema\}\}/g, process.env.FRONTEND_URL || '#');
    } catch (error) {
      logger.error(`Error cargando template ${templateName}:`, error);
      // Retornar template básico si falla
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <p>Este es un mensaje automático del sistema Megasys.</p>
        </body>
        </html>
      `;
    }
  }
}

module.exports = new EmailService();