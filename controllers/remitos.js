const Remito = require("../models/Remito");
const RemitoInventario = require("../models/Remito_Inventario");
const Inventario = require("../models/Inventario");
const HistoricoInventario = require("../models/HistoricoInventario");
const Sede = require("../models/Sede");

const remitosGET = async (req, res) => {
  try {
    const remitos = await Remito.findAll({
      include: [
        { model: Sede, attributes: ["nombre"] },
        {
          model: Inventario,
          through: { attributes: ["es_prestamo"] },
          attributes: ["marca", "modelo", "tipo_articulo", "num_serie", "service_tag", "activo"],
        },
      ],
    });

    
    const formattedRemitos = remitos.map(remito => ({
      id_remito: remito.id_remito,
      id_sede: remito.id_sede,
      sede_nombre: remito.Sede.nombre,
      solicitante: remito.solicitante,
      fecha_remito: remito.fecha_remito,
      transportista: remito.transportista,
      inventarios: remito.Inventarios.map(inventario => ({
        marca: inventario.marca,
        modelo: inventario.modelo,
        tipo_articulo: inventario.tipo_articulo,
        num_serie: inventario.num_serie,
        service_tag: inventario.service_tag,
        activo: inventario.activo,
        es_prestamo: inventario.RemitoInventario.es_prestamo
      }))
    }));

    
    res.status(200).json(formattedRemitos);
  } catch (error) {
    console.error("Error al obtener los remitos:", error);
    res.status(500).send("Error al obtener los remitos");
  }
};


const remitosPOST = async (req, res) => {
  const { id_sede, solicitante, fecha_remito, transportista, inventario } =
    req.body;

  try {
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

    // Actualizar id_sede de los equipos y registrar en el histórico
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

    res.status(201).json(nuevoRemito);
  } catch (error) {
    console.error("Error al crear el remito:", error);
    res.status(500).send("Error al crear el remito");
  }
};

const verEquiposEnPrestamo = async (req, res) => {
  try {
    const equiposEnPrestamo = await RemitoInventario.findAll({
      where: { es_prestamo: true },
      include: [
        {
          model: Inventario
        },
        {
          model: Remito,
          attributes: [
            "id_sede",
            "solicitante",
            "fecha_remito",
            "transportista",
          ],
        },
      ],
    });

    res.status(200).json(equiposEnPrestamo);
  } catch (error) {
    console.error("Error al obtener los equipos en préstamo:", error);
    res.status(500).send("Error al obtener los equipos en préstamo");
  }
};

const remitoByID = async (req, res) => {
  const { id } = req.params;

  try {
    const remito = await Remito.findOne({
      where: { id_remito: id },
      include: [
        {
          model: Sede,
          attributes: ["nombre"],
        },
        {
          model: Inventario,
          through: { attributes: ["es_prestamo"] },
          attributes: ["marca", "modelo", "tipo_articulo", "num_serie", "service_tag", "activo"],
        },
      ],
    });

    if (!remito) {
      return res.status(404).send("Remito no encontrado");
    }

    const formattedRemito = {
      id_remito: remito.id_remito,
      id_sede: remito.id_sede,
      sede_nombre: remito.Sede.nombre,
      solicitante: remito.solicitante,
      fecha_remito: remito.fecha_remito,
      transportista: remito.transportista,
      inventarios: remito.Inventarios.map(inventario => ({
        marca: inventario.marca,
        modelo: inventario.modelo,
        tipo_articulo: inventario.tipo_articulo,
        num_serie: inventario.num_serie,
        service_tag: inventario.service_tag,
        activo: inventario.activo,
        es_prestamo: inventario.RemitoInventario.es_prestamo
      }))
    };

    res.status(200).json(formattedRemito);
  } catch (error) {
    console.error("Error al obtener el remito:", error);
    res.status(500).send("Error al obtener el remito");
  }
};


module.exports = {
  remitosGET,
  remitosPOST,
  verEquiposEnPrestamo,
  remitoByID
};
