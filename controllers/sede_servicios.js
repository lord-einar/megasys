const Proveedor = require("../models/Proveedor");
const SedeServicio = require("../models/Sede_Servicio");
const Servicio = require("../models/Servicio");
const ServicioProveedor = require("../models/Servicio_Proveedor");

const sedeServiciosGET = async (req, res) => {
  const respuesta = await SedeServicio.findAll();
  console.log("Hola");
  res.status(200).send(respuesta);
};

const servicioBySedeID = async (id) => {

  console.log(id)
  try {
    const servicios = await SedeServicio.findAll({
      where: { id_sede: id },
      attributes: ["id_servicioProveedor"],
    })

    const idsServicioProveedor = servicios.map(servicio => servicio.dataValues.id_servicioProveedor);

    return idsServicioProveedor
  } catch (error) {
    console.error("Error al consultar servicios:", error);
  }
};

const asignarServicioASede = async (req, res) => {
  const { id_sede, id_servicioProveedor } = req.body;

  try {
    const resultado = await SedeServicio.create({
      id_sede,
      id_servicioProveedor,
    });
    res.status(200).send({
      msg: "Servicio vinculado correctamente:",
      resultado,
    });
  } catch (error) {
    console.error("Error al vincular el servicio:", error);
  }
};

module.exports = { sedeServiciosGET, servicioBySedeID, asignarServicioASede };
