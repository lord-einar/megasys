const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const Servicio = require("./Servicio");
const Proveedor = require("./Proveedor");
const sequelize = dbConnect();

class ServicioProveedor extends Model {}

ServicioProveedor.init(
  {
    id_servicioProveedor: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    id_servicio: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Servicios", // Asegúrate de que el nombre del modelo es correcto
        key: "id_servicio",
      },
    },
    id_proveedor: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Proveedores", // Asegúrate de que el nombre del modelo es correcto
        key: "id_proveedor",
      },
    },
    servicioID: {
      type: DataTypes.STRING,
    },
    contrato: {
      type: DataTypes.STRING,
    },
    fechaInicio: {
      type: DataTypes.DATE,
    },
    fechaFin: {
      type: DataTypes.DATE,
    },
    estado: {
      type: DataTypes.BOOLEAN,
    },
    observaciones: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "ServicioProveedor",
    tableName: "servicio_proveedor", // Nombre de la tabla en la base de datos
  }
);

ServicioProveedor.belongsTo(Servicio, { foreignKey: "id_servicio" });
ServicioProveedor.belongsTo(Proveedor, { foreignKey: "id_proveedor" });

module.exports = ServicioProveedor;
