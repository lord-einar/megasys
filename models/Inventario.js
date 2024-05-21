const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect();

class Inventario extends Model {}

Inventario.init({
  id_inventario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_sede: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sedes',
      key: 'id_sede'
    }
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_articulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service_tag: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Inventario'
});

module.exports = Inventario