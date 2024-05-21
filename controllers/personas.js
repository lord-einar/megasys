const Persona = require("../models/Persona");

const personasGET = async (req, res) => {
    res.status(200).send('okUser GET')
//   const usuarios = await User.findAll({ order: [["nombre", "ASC"]] });

//   res.json(usuarios);
};

const personasPOST = async (req, res) => {
  const { nombre, user } = req.body;

  await Persona.sync({ force: false });
  const personas = await Persona.create({ nombre, user });

  res.json(personas);
};


module.exports = {
    personasGET,
    personasPOST
};
