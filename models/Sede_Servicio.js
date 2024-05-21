const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect(); 

class SedeServicio extends Model {}

SedeServicio.init({
  id_sede: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sedes',
      key: 'id_sede'
    }
  },
  id_servicio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Servicios',
      key: 'id_servicio'
    }
  },
  id_proveedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Proveedores',
      key: 'id_proveedor'
    }
  }
}, {
  sequelize,
  modelName: 'sede_servicio'
});


module.exports = SedeServicio