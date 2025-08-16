// ============================================
// backend/src/models/Remito.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Remito = sequelize.define('remito', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  numero_remito: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  sede_origen_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  sede_destino_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  creado_por_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: { model: 'usuarios', key: 'id' }
  },
  solicitante_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('preparado', 'en_transito', 'entregado', 'confirmado'),
    defaultValue: 'preparado',
    allowNull: false
  },
  tecnico_asignado_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    references: { model: 'usuarios', key: 'id' }
  },
  pdf_entrega_path: {
    type: DataTypes.STRING(500)
  },
  pdf_confirmacion_path: {
    type: DataTypes.STRING(500)
  },
  fecha_preparacion: {
    type: DataTypes.DATE
  },
  fecha_transito: {
    type: DataTypes.DATE
  },
  fecha_entrega: {
    type: DataTypes.DATE
  },
  fecha_confirmacion: {
    type: DataTypes.DATE
  },
  token_confirmacion: {
    type: DataTypes.STRING(255),
    unique: true
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'remitos',
  indexes: [
    {
      unique: true,
      fields: ['numero_remito']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha']
    },
    {
      fields: ['sede_origen_id', 'sede_destino_id']
    }
  ]
});

module.exports = Remito;
