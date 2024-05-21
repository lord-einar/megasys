const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect();  // Obtén la instancia de sequelize.

class Sede extends Model {}

Sede.init({
  id_sede: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_empresa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Empresas',
      key: 'id_empresa'
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip_asignada: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Sede'
});

module.exports = Sede