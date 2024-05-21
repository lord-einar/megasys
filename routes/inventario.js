const {Router} = require('express');
const { inventarioGET, inventarioPOST } = require('../controllers/inventario');


const router = Router();

router.get('/', inventarioGET)

router.post('/', inventarioPOST)


module.exports = router;