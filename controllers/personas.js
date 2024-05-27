const Persona = require("../models/Persona");

const personasGET = async (req, res) => {
    const personas = await Persona.findAll();

    res.status(200).send(personas)
};

const personasPOST = async (req, res) => {
  const { nombre, email, telefono } = req.body;

  try {
    await Persona.sync({ force: false });
    const personas = await Persona.create({ nombre, email, telefono });
  
    res.json(personas);
    
  } catch (error) {
    res.status(500).send("Error al crear la persona: " + error.message);
  }

};


module.exports = {
    personasGET,
    personasPOST
};
