const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect();  // Obtén la instancia de sequelize.

class Rol extends Model {}

Rol.init({
  id_rol: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,  // Usar la instancia obtenida.
  modelName: 'Rol'
});


// Puedes optar por sincronizar dentro de un controlador o durante la inicialización del servidor.
module.exports = Rol;