// ============================================
// backend/src/models/HistorialInventario.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialInventario = sequelize.define('historial_inventario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  inventario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inventario',
      key: 'id'
    }
  },
  remito_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'remitos',
      key: 'id'
    }
  },
  sede_origen_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  sede_destino_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tipo_movimiento: {
    type: DataTypes.ENUM('ingreso', 'egreso', 'transferencia', 'baja', 'prestamo', 'devolucion'),
    allowNull: false
  },
usuario_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: { model: 'usuarios', key: 'id' }
},
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'historial_inventario',
  indexes: [
    {
      fields: ['inventario_id']
    },
    {
      fields: ['fecha_movimiento']
    },
    {
      fields: ['tipo_movimiento']
    }
  ]
});

module.exports = HistorialInventario;