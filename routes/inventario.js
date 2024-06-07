const {Router} = require('express');
const { inventarioGET, inventarioPOST, verHistoricoInventario, inventarioBySedeIDHandler  } = require('../controllers/inventario');


const router = Router();

router.get('/', inventarioGET)

router.post('/', inventarioPOST)

router.get('/historico/:id_inventario', verHistoricoInventario);

router.get('/bysede/:id_sede', inventarioBySedeIDHandler);


module.exports = router;