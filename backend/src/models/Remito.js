// backend/src/models/Remito.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Remito = sequelize.define('remito', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // BIGINT y default desde la secuencia creada en la migración
  numero_remito: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    defaultValue: Sequelize.literal(`nextval('remitos_numero_seq')`)
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // FKs: NO poner defaultValue en foreign keys
  sede_origen_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sede_destino_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Quien solicita → es “personal” (no usuario)
  solicitante_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Quien crea/asigna/toca → es “usuario” del sistema
  creado_por_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tecnico_asignado_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('preparado', 'en_transito', 'entregado', 'confirmado'),
    allowNull: false,
    defaultValue: 'preparado'
  },
  pdf_entrega_path: DataTypes.STRING(500),
  pdf_confirmacion_path: DataTypes.STRING(500),
  fecha_preparacion: DataTypes.DATE,
  fecha_transito: DataTypes.DATE,
  fecha_entrega: DataTypes.DATE,
  fecha_confirmacion: DataTypes.DATE,
  token_confirmacion: { type: DataTypes.STRING(255), unique: true },
  observaciones: DataTypes.TEXT
}, {
  tableName: 'remitos',
  indexes: [
    { unique: true, fields: ['numero_remito'] },
    { fields: ['estado'] },
    { fields: ['fecha'] },
    { fields: ['sede_origen_id', 'sede_destino_id'] }
  ]
});

module.exports = Remito;
