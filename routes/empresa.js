const {Router} = require('express');
const { empresaGet, empresaPost } = require('../controllers/empresa');


const router = Router();

router.get('/', empresaGet)

router.post('/', empresaPost)


module.exports = router;