const {Router} = require('express');
const { inventarioGET, inventarioPOST, verHistoricoInventario } = require('../controllers/inventario');


const router = Router();

router.get('/', inventarioGET)

router.post('/', inventarioPOST)

router.get('/historico/:id_inventario', verHistoricoInventario);


module.exports = router;