const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect(); 

class Proveedor extends Model {}

Proveedor.init({
  id_proveedor: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_ejecutivo: {
    type: DataTypes.STRING,
  },
  email_ejecutivo: {
    type: DataTypes.STRING,
  },
  email_soporte_1: {
    type: DataTypes.STRING,
  },
  email_soporte_2: {
    type: DataTypes.STRING,
  },
  email_soporte_3: {
    type: DataTypes.STRING,
  },
  telefono_soporte_1: {
    type: DataTypes.STRING,
  },
  telefono_soporte_2: {
    type: DataTypes.STRING,
  },
  telefono_soporte_3: {
    type: DataTypes.STRING,
  },
  observaciones: {
    type: DataTypes.STRING,
  }
}, {
  sequelize,
  modelName: 'Proveedor',
  tableName: 'Proveedores'
});

module.exports = Proveedor