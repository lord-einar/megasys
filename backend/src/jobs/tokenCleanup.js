// ============================================
// backend/src/jobs/tokenCleanup.js
// NUEVO: Job para limpiar tokens expirados
// ============================================
const cron = require('node-cron');
const remitoService = require('../services/remitoService');
const { logger } = require('../utils/logger');

class TokenCleanupJob {
  constructor() {
    // Ejecutar cada 6 horas
    this.cronExpression = '0 */6 * * *';
    this.timezone = 'America/Argentina/Buenos_Aires';
  }
  
  /**
   * Iniciar job de limpieza
   */
  start() {
    cron.schedule(this.cronExpression, async () => {
      logger.info('Iniciando limpieza de tokens expirados...');
      await this.limpiarTokens();
    }, {
      timezone: this.timezone
    });
    
    logger.info('Job de limpieza de tokens programado (cada 6 horas)');
  }
  
  /**
   * Ejecutar limpieza de tokens
   */
  async limpiarTokens() {
    try {
      const tokensLimpiados = await remitoService.limpiarTokensExpirados();
      
      if (tokensLimpiados > 0) {
        logger.info(`Limpieza completada: ${tokensLimpiados} tokens eliminados`);
      } else {
        logger.debug('Limpieza completada: sin tokens expirados');
      }
      
    } catch (error) {
      logger.error('Error en limpieza de tokens:', error);
    }
  }
}

module.exports = new TokenCleanupJob();