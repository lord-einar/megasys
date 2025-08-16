const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExtensionPrestamo = sequelize.define('extension_prestamo', {
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
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  aprobado_por_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_solicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_aprobacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'extensiones_prestamo',
  timestamps: true,
  underscored: true,
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