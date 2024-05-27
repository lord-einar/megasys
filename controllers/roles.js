const Rol = require("../models/Rol");

const rolesGET = async (req, res) => {
  const roles = await Rol.findAll();

  res.json(roles);
};

const rolesPOST = async (req, res) => {
  const { nombre } = req.body;

  try {
      const rol = await Rol.create({ nombre });
      res.json(rol);
  } catch (error) {
      res.status(500).send('Error al crear el rol: ' + error.message);
  }
};


module.exports = {
    rolesGET,
    rolesPOST
};