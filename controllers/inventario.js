const Inventario = require("../models/Inventario");

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
        { model: Sede, attributes: ['nombre'] },
        { model: Remito, attributes: ['solicitante', 'fecha_remito', 'transportista'] }
      ]
    });

    res.status(200).json(historico);
  } catch (error) {
    console.error('Error al obtener el histórico del inventario:', error);
    res.status(500).send('Error al obtener el histórico del inventario');
  }
};


module.exports = {
  inventarioGET,
  inventarioPOST,
  verHistoricoInventario
};
