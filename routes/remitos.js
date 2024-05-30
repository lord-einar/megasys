const express = require("express");
const router = express.Router();
const {
  crearRemito,
  verTodosLosRemitos,
  verEquiposEnPrestamo,
} = require("../controllers/remitos");

router.post("/crear", crearRemito);
router.get("/todos", verTodosLosRemitos);
router.get("/prestamos", verEquiposEnPrestamo);

module.exports = router;
