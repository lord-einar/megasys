const User = require("../models/User");


const userGET = async (req, res) => {
    res.status(200).send('okUser GET')
  const usuarios = await User.findAll({ order: [["nombre", "ASC"]] });

  res.json(usuarios);
};

const userActiveGET = async (req, res) => {
  const usuarios = await User.findAll({
    where: { active: 1 },
    order: [["nombre", "ASC"]],
  });

  res.json(usuarios);
};

const userPOST = async (req, res) => {
  const { nombre, user } = req.body;

  await User.sync({ force: false });
  const usuarios = await User.create({ nombre, user });

  res.json(usuarios);
};


module.exports = {
    userGET,
    userActiveGET,
    userPOST
};
