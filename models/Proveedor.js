const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect(); 

class Proveedor extends Model {}

Proveedor.init({
  id_proveedor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_ejecutivo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_ejecutivo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email_soporte: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono_soporte_n1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono_soporte_n2: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono_soporte_n3: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Proveedor',
  tableName: 'Proveedores'
});

module.exports = Proveedor