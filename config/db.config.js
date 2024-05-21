const { Sequelize } = require("sequelize");

// Mantiene una instancia singleton de Sequelize.
let sequelize;

const dbConnect = () => {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DATABASE,
      process.env.USER,
      process.env.PASS,
      {
        host: "localhost",
        dialect: "mysql",
      }
    );

    sequelize
      .authenticate()
      .then(() => {
        console.log("Base de datos conectada!!!");
      })
      .catch((error) => {
        console.error("Error al conectar a la base de datos:", error);
        throw error;
      });
  }
  return sequelize;
};

module.exports = dbConnect;
