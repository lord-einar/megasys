// ============================================
// backend/src/jobs/prestamoReminder.js
// ============================================
const cron = require('node-cron');
const { Inventario, Personal, TipoArticulo } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');
const { logger } = require('../utils/logger');
const { getDaysDifference } = require('../utils/helpers');

class PrestamoReminderJob {
  constructor() {
    this.cronExpression = '0 9 * * *'; // Todos los días a las 9 AM
    this.timezone = 'America/Argentina/Buenos_Aires';
  }
  
  /**
   * Iniciar job
   */
  start() {
    cron.schedule(this.cronExpression, async () => {
      logger.info('Iniciando job de recordatorios de préstamos...');
      await this.checkPrestamosVencidos();
      await this.checkPrestamosProximos();
    }, {
      timezone: this.timezone
    });
    
    logger.info('Job de recordatorios de préstamos programado');
  }
  
  /**
   * Verificar préstamos vencidos
   */
  async checkPrestamosVencidos() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const prestamosVencidos = await Inventario.findAll({
        where: {
          prestamo: true,
          devuelto: false,
          fecha_devolucion: {
            [Op.lt]: hoy
          }
        },
        include: [
          { model: Personal, as: 'usuario_prestamo' },
          { model: TipoArticulo, as: 'tipo' }
        ]
      });
      
      for (const prestamo of prestamosVencidos) {
        const diasVencido = getDaysDifference(prestamo.fecha_devolucion);
        
        // Enviar recordatorio cada 3 días
        if (diasVencido % 3 === 0) {
          await this.enviarRecordatorioVencido(prestamo, diasVencido);
        }
      }
      
      logger.info(`Procesados ${prestamosVencidos.length} préstamos vencidos`);
    } catch (error) {
      logger.error('Error verificando préstamos vencidos:', error);
    }
  }
  
  /**
   * Verificar préstamos próximos a vencer
   */
  async checkPrestamosProximos() {
    try {
      const hoy = new Date();
      const en7Dias = new Date();
      en7Dias.setDate(en7Dias.getDate() + 7);
      
      const prestamosProximos = await Inventario.findAll({
        where: {
          prestamo: true,
          devuelto: false,
          fecha_devolucion: {
            [Op.between]: [hoy, en7Dias]
          }
        },
        include: [
          { model: Personal, as: 'usuario_prestamo' },
          { model: TipoArticulo, as: 'tipo' }
        ]
      });
      
      for (const prestamo of prestamosProximos) {
        const diasRestantes = getDaysDifference(new Date(), prestamo.fecha_devolucion);
        
        // Enviar recordatorio a los 7, 3 y 1 día
        if ([7, 3, 1].includes(diasRestantes)) {
          await this.enviarRecordatorioProximo(prestamo, diasRestantes);
        }
      }
      
      logger.info(`Procesados ${prestamosProximos.length} préstamos próximos a vencer`);
    } catch (error) {
      logger.error('Error verificando préstamos próximos:', error);
    }
  }
  
  /**
   * Enviar recordatorio de préstamo vencido
   */
  async enviarRecordatorioVencido(prestamo, diasVencido) {
    try {
      const subject = `URGENTE: Préstamo vencido hace ${diasVencido} días - ${prestamo.service_tag}`;
      const html = `
        <h2>Préstamo Vencido</h2>
        <p>Estimado/a ${prestamo.usuario_prestamo.nombre} ${prestamo.usuario_prestamo.apellido},</p>
        <p>Le recordamos que el siguiente equipo tiene un préstamo <strong>vencido hace ${diasVencido} días</strong>:</p>
        <ul>
          <li><strong>Equipo:</strong> ${prestamo.tipo.nombre} - ${prestamo.marca} ${prestamo.modelo}</li>
          <li><strong>Service Tag:</strong> ${prestamo.service_tag}</li>
          <li><strong>Fecha de vencimiento:</strong> ${prestamo.fecha_devolucion.toLocaleDateString('es-AR')}</li>
        </ul>
        <p>Por favor, proceda con la devolución del equipo a la brevedad.</p>
        <p>Si necesita una extensión, solicítela a través del sistema.</p>
      `;
      
      await emailService.sendEmail(prestamo.usuario_prestamo.email, subject, html);
      logger.info(`Recordatorio de vencimiento enviado a ${prestamo.usuario_prestamo.email}`);
    } catch (error) {
      logger.error('Error enviando recordatorio vencido:', error);
    }
  }
  
  /**
   * Enviar recordatorio de préstamo próximo a vencer
   */
  async enviarRecordatorioProximo(prestamo, diasRestantes) {
    try {
      await emailService.sendPrestamoVencimiento(prestamo, prestamo.usuario_prestamo);
      logger.info(`Recordatorio enviado: ${diasRestantes} días para vencer - ${prestamo.service_tag}`);
    } catch (error) {
      logger.error('Error enviando recordatorio próximo:', error);
    }
  }
}

module.exports = new PrestamoReminderJob();