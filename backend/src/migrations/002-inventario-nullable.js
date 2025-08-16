'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Permitir NULL en service_tag
      await queryInterface.changeColumn('inventario', 'service_tag', {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true
      }, { transaction });

      // Permitir NULL en numero_serie
      await queryInterface.changeColumn('inventario', 'numero_serie', {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true
      }, { transaction });

      // Recrear índices únicos condicionales
      await queryInterface.removeIndex('inventario', 'inventario_service_tag_key', { transaction });
      await queryInterface.addIndex('inventario', ['service_tag'], {
        unique: true,
        where: {
          service_tag: {
            [Sequelize.Op.ne]: null
          }
        },
        name: 'inventario_service_tag_unique',
        transaction
      });

      // Si existe índice de numero_serie, actualizarlo
      try {
        await queryInterface.removeIndex('inventario', 'inventario_numero_serie_key', { transaction });
      } catch (e) {
        // El índice podría no existir
      }
      
      await queryInterface.addIndex('inventario', ['numero_serie'], {
        unique: true,
        where: {
          numero_serie: {
            [Sequelize.Op.ne]: null
          }
        },
        name: 'inventario_numero_serie_unique',
        transaction
      });

      await transaction.commit();
      console.log('✅ Actualización de inventario completada');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Revertir service_tag a NOT NULL
      await queryInterface.changeColumn('inventario', 'service_tag', {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};