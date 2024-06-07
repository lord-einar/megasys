const Inventario = require("../models/Inventario");
const RemitoInventario = require("../models/Remito_Inventario");

const inventarioGET = async (req, res) => {
  const inventarios = await Inventario.findAll();

  res.json(inventarios);
};

const inventarioPOST = async (req, res) => {
  const {
    id_sede,
    marca,
    modelo,
    tipo_articulo,
    service_tag,
    activo,
    num_serie,
  } = req.body;

  try {
    const inventario = await Inventario.create({
      id_sede,
      marca,
      modelo,
      tipo_articulo,
      service_tag,
      activo,
      num_serie,
    });

    res.json(inventario);
  } catch (error) {
    res.status(500).send("Error al crear el inventario: " + error.message);
  }
};

const verHistoricoInventario = async (req, res) => {
  const { id_inventario } = req.params;

  try {
    const historico = await HistoricoInventario.findAll({
      where: { id_inventario },
      include: [
        { model: Sede, attributes: ["nombre"] },
        {
          model: Remito,
          attributes: ["solicitante", "fecha_remito", "transportista"],
        },
      ],
    });

    res.status(200).json(historico);
  } catch (error) {
    console.error("Error al obtener el histórico del inventario:", error);
    res.status(500).send("Error al obtener el histórico del inventario");
  }
};

const inventarioBySedeID = async (id) => {
  try {
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

    console.log(inventarios);

    const inventariosConPrestamo = inventarios.map((inventario) => {
      // Verifica si existen registros de RemitoInventario que indican que es un préstamo
      inventario.dataValues.es_prestamo =
        inventario.RemitoInventarios.length > 0;
      return inventario;
    });

    return inventariosConPrestamo;
  } catch (error) {
    console.error("Error al consultar inventarios:", error);
  }
};

const inventarioBySedeIDHandler = async (req, res) => {
  const id = req.params.id_sede || req.query.id_sede;
  
  if (!id) {
    return res.status(400).json({ msg: 'El ID es obligatorio' });
  }

  try {
    const inventarios = await inventarioBySedeID(id);
    res.json(inventarios);
  } catch (error) {
    console.error("Error al obtener inventarios:", error);
    res.status(500).send("Error al obtener inventarios");
  }
};

module.exports = {
  inventarioGET,
  inventarioPOST,
  verHistoricoInventario,
  inventarioBySedeID,
  inventarioBySedeIDHandler
};
