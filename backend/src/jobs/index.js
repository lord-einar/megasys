// ============================================
// backend/src/jobs/index.js
// ============================================
const prestamoReminder = require('./prestamoReminder');
const { logger } = require('../utils/logger');

class JobManager {
  constructor() {
    this.jobs = [
      prestamoReminder
    ];
  }
  
  /**
   * Iniciar todos los jobs
   */
  start() {
    logger.info('Iniciando CRON jobs...');
    
    this.jobs.forEach(job => {
      try {
        job.start();
      } catch (error) {
        logger.error(`Error iniciando job:`, error);
      }
    });
    
    logger.info(`${this.jobs.length} CRON jobs iniciados`);
  }
  
  /**
   * Detener todos los jobs
   */
  stop() {
    logger.info('Deteniendo CRON jobs...');
    // Implementar lógica de detención si es necesaria
  }
}

module.exports = new JobManager();