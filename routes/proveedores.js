const {Router} = require('express');
const { proveedoresGET, proveedoresPOST } = require('../controllers/proveedores');



const router = Router();

router.get('/', proveedoresGET)

router.post('/', proveedoresPOST)


module.exports = router;