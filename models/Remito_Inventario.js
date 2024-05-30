const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect(); 

class RemitoInventario extends Model {}

RemitoInventario.init({
  id_remito: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Remito',
      key: 'id_remito'
    }
  },
  id_inventario: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Inventario',
      key: 'id_inventario'
    }
  },
  es_prestamo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'RemitoInventario',
  tableName: 'remito_inventarios'
});

module.exports = RemitoInventario;
