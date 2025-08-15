// ============================================
// backend/src/models/ExtensionPrestamo.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExtensionPrestamo = sequelize.define('extension_prestamo', {
  id: {
    type: DataTypes.INTEGER,
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
  fecha_devolucion_original: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_devolucion_nueva: {
    type: DataTypes.DATE,
    allowNull: false
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  solicitante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  aprobado_por_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  fecha_solicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_aprobacion: {
    type: DataTypes.DATE
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'extensiones_prestamo',
  indexes: [
    {
      fields: ['inventario_id']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = ExtensionPrestamo;