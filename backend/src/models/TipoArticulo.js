const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoArticulo = sequelize.define('tipo_articulo', {
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
  },
  requiere_serie: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indica si este tipo de artículo requiere número de serie'
  }
}, {
  tableName: 'tipo_articulos',
  timestamps: true,
  underscored: true
});

module.exports = TipoArticulo;