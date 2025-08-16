// ============================================
// backend/src/models/TipoServicio.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoServicio = sequelize.define('tipo_servicio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'tipo_servicios'
});

module.exports = TipoServicio;
