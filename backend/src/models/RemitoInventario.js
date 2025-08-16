// ============================================
// backend/src/models/RemitoInventario.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RemitoInventario = sequelize.define('remito_inventario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  remito_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'remitos',
      key: 'id'
    }
  },
  inventario_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'inventario',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'remito_inventario',
  indexes: [
    {
      fields: ['remito_id', 'inventario_id']
    }
  ]
});

module.exports = RemitoInventario;