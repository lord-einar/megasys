const {Router} = require('express');
const { rolesGET, rolesPOST } = require('../controllers/roles');

const router = Router();

router.get('/', rolesGET)

router.post('/', rolesPOST)


module.exports = router;