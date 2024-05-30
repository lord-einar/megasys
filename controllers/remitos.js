const Remito = require("../models/Remito");
const RemitoInventario = require("../models/Remito_Inventario");
const Inventario = require("../models/Inventario");

const verTodosLosRemitos = async (req, res) => {
    try {
      const remitos = await Remito.findAll({
        include: [
          { model: Sede, attributes: ['nombre'] },
          { model: Inventario, through: { attributes: ['es_prestamo'] }, attributes: ['nombre'] }
        ]
      });
  
      res.status(200).json(remitos);
    } catch (error) {
      console.error('Error al obtener los remitos:', error);
      res.status(500).send('Error al obtener los remitos');
    }
  };
  

const crearRemito = async (req, res) => {
  const { id_sede, solicitante, fecha_remito, transportista, inventarios } =
    req.body;

  try {
    const nuevoRemito = await Remito.create({
      id_sede,
      solicitante,
      fecha_remito,
      transportista,
    });

    const remitoInventarios = inventarios.map((inventario) => ({
      id_remito: nuevoRemito.id_remito,
      id_inventario: inventario.id_inventario,
      es_prestamo: inventario.es_prestamo,
    }));

    await RemitoInventario.bulkCreate(remitoInventarios);

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
            model: Inventario,
            attributes: ['nombre'],
          },
          {
            model: Remito,
            attributes: ['id_sede', 'solicitante', 'fecha_remito', 'transportista']
          }
        ]
      });
  
      res.status(200).json(equiposEnPrestamo);
    } catch (error) {
      console.error('Error al obtener los equipos en préstamo:', error);
      res.status(500).send('Error al obtener los equipos en préstamo');
    }
  };
  

module.exports = {
  crearRemito,
  verTodosLosRemitos,
  verEquiposEnPrestamo
};
