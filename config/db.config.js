const { Sequelize } = require("sequelize");

// Mantiene una instancia singleton de Sequelize.
let sequelize;

const dbConnect = () => {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DATABASE,
      process.env.DBUSER,
      process.env.PASS,    
      {
        host: "germanojeda.ar",
        dialect: "mariadb",
        dialectOptions: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci'
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 60000, // Tiempo de espera para adquirir una conexión del pool en milisegundos
          idle: 10000 // Tiempo de espera antes de liberar una conexión inactiva en milisegundos
        },
        define: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci'
        }
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
