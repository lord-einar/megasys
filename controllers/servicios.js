const Servicio = require("../models/Servicio");
const { servicioProveedorByIDServicio } = require("./servicio_proveedor");


const serviciosGET = async (req, res) => {
  const usuarios = await Servicio.findAll();

  res.json(usuarios);
};

const serviciosPOST = async (req, res) => {
  const { nombre } = req.body;

  try {
    await Servicio.sync({ force: false });
    const servicios = await Servicio.create({ nombre });
  
    res.json(servicios);
} catch (error) {
    res.status(500).send('Error al crear el servicio: ' + error.message);
}

};

const serviciosByID = async (req, res) => {

  const id = req.params.id
  const servicios = await Servicio.findByPk(id, {
    attributes: {exclude: ['id_servicio', "createdAt", "updatedAt"]},
  });

  
  const proveedores = await servicioProveedorByIDServicio(id)
  
  res.json({
    servicios,
    proveedores
  })

}


module.exports = {
    serviciosGET,
    serviciosPOST,
    serviciosByID
};