const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect(); 

class Remito extends Model {}

Remito.init({
  id_remito: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  id_sede: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Sedes',
      key: 'id_sede'
    }
  },
  solicitante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_remito: {
    type: DataTypes.DATE,
    allowNull: false
  },
  transportista: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Remito',
  tableName: 'remitos'
});

module.exports = Remito;


module.exports = Remito;
