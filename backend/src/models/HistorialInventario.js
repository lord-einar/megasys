const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialInventario = sequelize.define('historial_inventario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  inventario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'inventario',
      key: 'id'
    }
  },
  remito_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'remitos',
      key: 'id'
    }
  },
  sede_origen_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  sede_destino_id: {
    type: DataTypes.UUID,
    allowNull: true,
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
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'historial_inventario',
  timestamps: true,
  underscored: true,
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