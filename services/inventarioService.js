const Inventario = require("../models/Inventario");
const RemitoInventario = require("../models/Remito_Inventario");
const HistoricoInventario = require("../models/HistoricoInventario");
const Sede = require("../models/Sede");
const Remito = require("../models/Remito");

const getInventarios = async () => {
  return await Inventario.findAll();
};

const createInventario = async (data) => {
  const {
    id_sede,
    marca,
    modelo,
    tipo_articulo,
    service_tag,
    activo,
    num_serie,
  } = data;

  return await Inventario.create({
    id_sede,
    marca,
    modelo,
    tipo_articulo,
    service_tag,
    activo,
    num_serie,
  });
};

const getHistoricoInventario = async (id_inventario) => {
  return await HistoricoInventario.findAll({
    where: { id_inventario },
    include: [
      { model: Sede, attributes: ["nombre"] },
      {
        model: Remito,
        attributes: ["solicitante", "fecha_remito", "transportista"],
      },
    ],
  });
};

const getInventarioBySedeID = async (id) => {
  const inventarios = await Inventario.findAll({
    where: { id_sede: id },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
    include: [
      {
        model: RemitoInventario,
        where: { es_prestamo: true },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        required: false,
      },
    ],
  });

  return inventarios.map((inventario) => {
    inventario.dataValues.es_prestamo = inventario.RemitoInventarios.length > 0;
    return inventario;
  });
};

module.exports = {
  getInventarios,
  createInventario,
  getHistoricoInventario,
  getInventarioBySedeID,
};
