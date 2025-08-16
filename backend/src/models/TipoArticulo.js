// ============================================
// backend/src/models/TipoArticulo.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoArticulo = sequelize.define('tipo_articulo', {
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
  },
  requiere_serie: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'tipo_articulos'
});

module.exports = TipoArticulo;
