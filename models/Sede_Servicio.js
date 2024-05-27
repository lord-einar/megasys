const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect();

class SedeServicio extends Model {}

SedeServicio.init(
  {
    id_sedeServicio: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    id_sede: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Sedes",
        key: "id_sede",
      },
    },
    id_servicioProveedor: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "servicio_proveedor",
        key: "id_servicioProveedor",
      },
    },    
  },
  {
    sequelize,
    modelName: "sede_servicio",
  }
);

module.exports = SedeServicio;
