const Remito = require("../models/Remito");
const RemitoInventario = require("../models/Remito_Inventario");
const Inventario = require("../models/Inventario");
const HistoricoInventario = require("../models/HistoricoInventario");
const { formatRemito, getRemitoInclusions } = require('../utils/remitoFormatter');

const getRemitos = async () => {
  const remitos = await Remito.findAll({
    include: getRemitoInclusions()
  });
  return remitos.map(formatRemito);
};

const getRemitoById = async (id) => {
  const remito = await Remito.findOne({
    where: { id_remito: id },
    include: getRemitoInclusions()
  });

  if (!remito) {
    throw new Error("Remito no encontrado");
  }

  return formatRemito(remito);
};

const createRemito = async (data) => {
  const { id_sede, solicitante, fecha_remito, transportista, inventario } = data;

  const nuevoRemito = await Remito.create({
    id_sede,
    solicitante,
    fecha_remito,
    transportista,
  });

  const remitoInventarios = inventario.map((item) => ({
    id_remito: nuevoRemito.id_remito,
    id_inventario: item.id_inventario,
    es_prestamo: item.es_prestamo,
  }));

  await RemitoInventario.bulkCreate(remitoInventarios);

  for (let item of inventario) {
    await Inventario.update(
      { id_sede },
      { where: { id_inventario: item.id_inventario } }
    );

    await HistoricoInventario.create({
      id_inventario: item.id_inventario,
      id_sede,
      id_remito: nuevoRemito.id_remito,
      fecha_movimiento: new Date(),
    });
  }

  return nuevoRemito;
};

const getEquiposEnPrestamo = async () => {
  const equiposEnPrestamo = await RemitoInventario.findAll({
    where: { es_prestamo: true },
    attributes: ['id_remito'],
    include: [
      {
        model: Inventario,
        attributes: ["marca", "modelo", "tipo_articulo", "num_serie", "service_tag", "activo"],
        include: [
          {
            model: require('../models/Sede'),
            attributes: ["nombre"]
          }
        ]
      },
      {
        model: Remito,
        attributes: [
          "id_sede",
          "solicitante",
          "fecha_remito",
          "transportista",
        ],
        include: [
          {
            model: require('../models/Sede'),
            attributes: ["nombre"]
          }
        ]
      },
    ],
  });

  return equiposEnPrestamo;
};

module.exports = {
  getRemitos,
  getRemitoById,
  createRemito,
  getEquiposEnPrestamo
};
