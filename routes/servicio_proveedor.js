const { Router } = require("express");
const { servicioProveedorGET, servicioProveedorPOST } = require("../controllers/servicio_proveedor");

const router = Router();

router.get("/", servicioProveedorGET);

router.post('/', servicioProveedorPOST);

module.exports = router;
