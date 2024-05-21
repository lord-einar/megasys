const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect();  // Obtén la instancia de sequelize.

class Empresa extends Model {}

Empresa.init({
  id_empresa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_empresa: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,  // Usar la instancia obtenida.
  modelName: 'Empresa'
});

// Puedes optar por sincronizar dentro de un controlador o durante la inicialización del servidor.
module.exports = Empresa;

