const express = require("express");
const cors = require("cors");
const dbConnect = require("../config/db.config");

class Server {
  constructor() {
    this.init();
  }

  async init() {
    this.app = express();
    this.port = process.env.PORT;

    try {
      const sequelize = await dbConnect(); // Asegúrate de que la base de datos esté conectada antes de continuar.
      this.middlewares();
      this.routes();
      this.listen();
      await sequelize.sync({ alter: true });
    } catch (error) {
      console.error("Error durante la inicialización del servidor:", error);
    }
  }

  async conectarDB() {
    await dbConnect();
  }

  middlewares() {
    //CORS
    this.app.use(cors());

    //Lectura y parseo JSON
    this.app.use(express.json());

    //Carpeta estatica
    this.app.use(express.static("public"));
  }

  routes() {
    this.app.use("/user", require("../routes/users"));
    this.app.use("/empresa", require("../routes/empresa"));
    this.app.use("/sedes", require("../routes/sedes"));
    this.app.use("/personas", require("../routes/personas"));
    this.app.use("/servicios", require("../routes/servicios"));
    this.app.use("/proveedores", require("../routes/proveedores"));
    this.app.use("/inventario", require("../routes/inventario"));
    this.app.use("/sede_persona", require("../routes/sede_persona"));
    this.app.use("/sede_servicios", require("../routes/sede_servicios"));
    this.app.use("/", require('../routes/home'));

  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Example app listening at http://localhost:${this.port}`);
    });
  }
}

module.exports = Server;