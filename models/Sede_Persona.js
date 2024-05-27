const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect(); 

class SedePersona extends Model {}

SedePersona.init({
  id_sedePersona: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_sede: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'Sedes',
      key: 'id_sede'
    }
  },
  id_persona: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  id_rol: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Rols',
      key: 'id_rol'
    }
  }
}, {
  sequelize,
  modelName: 'sede_persona'
});

module.exports = SedePersona