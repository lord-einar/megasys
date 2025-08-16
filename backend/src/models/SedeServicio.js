// ============================================
// backend/src/models/SedeServicio.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SedeServicio = sequelize.define('sede_servicio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  sede_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  servicio_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'servicios',
      key: 'id'
    }
  },
  proveedor_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'sede_servicios',
  indexes: [
    {
      fields: ['sede_id', 'servicio_id', 'activo']
    }
  ]
});

module.exports = SedeServicio;
