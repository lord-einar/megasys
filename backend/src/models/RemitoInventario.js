const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RemitoInventario = sequelize.define('remito_inventario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  remito_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'remitos',
      key: 'id'
    }
  },
  inventario_id: {
    type: DataTypes.UUID,
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
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'remito_inventario',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['remito_id', 'inventario_id']
    }
  ]
});

module.exports = RemitoInventario;