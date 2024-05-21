const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect(); 

class SedePersona extends Model {}

SedePersona.init({
  id_sede: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sedes',
      key: 'id_sede'
    }
  },
  id_persona: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'sede_persona'
});

module.exports = SedePersona