const express = require("express");
const cors = require("cors");
const dbConnect = require("../config/db.config");
const morgan = require("morgan");

class Server {
  constructor() {
    this.init();
  }

  async init() {
    this.app = express();
    this.port = process.env.PORT;

    try {
      const sequelize = await dbConnect(); // Asegúrate de que la base de datos esté conectada antes de continuar.
      await sequelize.sync({ alter: true });
      this.middlewares();
      this.routes();
      // this.listen();
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

    this.app.use(morgan('dev'));
  }

  routes() {
    this.app.use("/user", require("../routes/users"));
    this.app.use("/empresa", require("../routes/empresa"));
    this.app.use("/sedes", require("../routes/sedes"));
    this.app.use("/personas", require("../routes/personas"));
    this.app.use("/roles", require("../routes/roles"));
    this.app.use("/servicios", require("../routes/servicios"));
    this.app.use("/proveedores", require("../routes/proveedores"));
    // this.app.use("/inventario", require("../routes/inventario"));
    this.app.use("/remitos", require("../routes/remitos"));
    this.app.use("/sedepersona", require("../routes/sede_persona"));
    this.app.use("/sedeservicio", require("../routes/sede_servicios"));
    this.app.use("/servicioproveedor", require("../routes/servicio_proveedor"));
    this.app.use("/", require('../routes/home'));

  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Example app listening at http://localhost:${this.port}`);
    });
  }
}

module.exports = Server;