const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Remito = sequelize.define('remito', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  sede_destino_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  solicitante_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  tecnico_asignado_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  creado_por_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('preparado', 'en_transito', 'entregado', 'confirmado'),
    allowNull: false,
    defaultValue: 'preparado'
  },
  pdf_entrega_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pdf_confirmacion_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  fecha_preparacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_transito: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_confirmacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  token_confirmacion: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'remitos',
  timestamps: true,
  underscored: true,
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