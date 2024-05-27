const Proveedor = require("../models/Proveedor");

const proveedoresGET = async (req, res) => {
  const usuarios = await Proveedor.findAll();

  res.json(usuarios);
};

const proveedoresPOST = async (req, res) => {
  const {
    nombre,
    direccion,
    localidad,
    provincia,
    pais,
    nombre_ejecutivo,
    email_ejecutivo,
    email_soporte_1,
    email_soporte_2,
    email_soporte_3,
    telefono, ejecutivo,
    telefono_soporte_1,
    telefono_soporte_2,
    telefono_soporte_3
  } = req.body;


  try {
    await Proveedor.sync({ force: false });
    const proveedores = await Proveedor.create({ 
      nombre,
      direccion,
      localidad,
      provincia,
      pais,
      nombre_ejecutivo,
      email_ejecutivo,
      email_soporte_1,
      email_soporte_2,
      email_soporte_3,
      telefono, ejecutivo,
      telefono_soporte_1,
      telefono_soporte_2,
      telefono_soporte_3
    });
  
    res.json(proveedores);

} catch (error) {
    res.status(500).send('Error al crear el rol: ' + error.message);
}
};

module.exports = {
  proveedoresGET,
  proveedoresPOST,
};
