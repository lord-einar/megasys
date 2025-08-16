const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoServicio = sequelize.define('tipo_servicio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'tipo_servicios',
  timestamps: true,
  underscored: true
});

module.exports = TipoServicio;