const {Router} = require('express');
const { remitosGET, remitosPOST, verEquiposEnPrestamo, remitoByID } = require('../controllers/remitos');


const router = Router();


router.get("/", remitosGET);
router.post("/", remitosPOST);
router.get("/prestamos", verEquiposEnPrestamo);
router.get('/:id', remitoByID)

module.exports = router;
