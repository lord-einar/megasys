const {Router} = require('express');
const { remitosGET, remitosPOST, verEquiposEnPrestamo } = require('../controllers/remitos');


const router = Router();


router.get("/", remitosGET);
router.post("/", remitosPOST);
router.get("/prestamos", verEquiposEnPrestamo);

module.exports = router;
