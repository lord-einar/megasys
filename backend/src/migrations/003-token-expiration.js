// ============================================
// backend/src/migrations/003-add-token-expiration.js
// AGREGADO: Campo de expiración para tokens de confirmación
// ============================================
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Agregar campo fecha_expiracion_token a tabla remitos
      await queryInterface.addColumn('remitos', 'fecha_expiracion_token', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración del token de confirmación (24 horas)'
      }, { transaction });

      // Crear índice para consultas de limpieza de tokens expirados
      await queryInterface.addIndex('remitos', ['fecha_expiracion_token'], {
        name: 'remitos_expiracion_token_idx',
        transaction
      });

      await transaction.commit();
      console.log('✅ Campo fecha_expiracion_token agregado');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Eliminar índice primero
      await queryInterface.removeIndex('remitos', 'remitos_expiracion_token_idx', {
        transaction
      });
      
      // Eliminar columna
      await queryInterface.removeColumn('remitos', 'fecha_expiracion_token', {
        transaction
      });

      await transaction.commit();
      console.log('✅ Campo fecha_expiracion_token eliminado');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};