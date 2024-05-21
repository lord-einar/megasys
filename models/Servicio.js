const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect();  // Obtén la instancia de sequelize.

class Servicio extends Model {}

Servicio.init({
  id_servicio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_servicio: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Servicio'
});

module.exports = Servicio