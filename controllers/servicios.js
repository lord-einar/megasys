const Servicio = require("../models/Servicio");


const serviciosGET = async (req, res) => {
    res.status(200).send('okUser GET')
//   const usuarios = await User.findAll({ order: [["nombre", "ASC"]] });

//   res.json(usuarios);
};

const serviciosPOST = async (req, res) => {
  const { nombre, user } = req.body;

  await Servicio.sync({ force: false });
  const servicios = await Servicio.create({ nombre, user });

  res.json(servicios);
};


module.exports = {
    serviciosGET,
    serviciosPOST
};