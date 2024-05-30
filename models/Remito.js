const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const Inventario = require("./Inventario");
const RemitoInventario = require("./Remito_Inventario");
const Sede = require("./Sede");
const sequelize = dbConnect(); 

class Remito extends Model {}

Remito.init({
  id_remito: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  },
  es_prestamo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Remito',
  tableName: 'remitos'
});

Remito.belongsToMany(Inventario, { through: RemitoInventario, foreignKey: 'id_remito' });
Inventario.belongsToMany(Remito, { through: RemitoInventario, foreignKey: 'id_inventario' });

Sede.hasMany(Remito, { foreignKey: 'id_sede' });
Remito.belongsTo(Sede, { foreignKey: 'id_sede' });

module.exports = Remito;
