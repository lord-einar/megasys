// ============================================
// backend/src/routes/index.js
// ============================================
const router = require('express').Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const sedeRoutes = require('./sedeRoutes');
const inventarioRoutes = require('./inventarioRoutes');
const remitoRoutes = require('./remitoRoutes');

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/sedes', sedeRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/remitos', remitoRoutes);

// Ruta raíz de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Megasys v1.0',
    endpoints: {
      auth: '/api/auth',
      sedes: '/api/sedes',
      inventario: '/api/inventario',
      remitos: '/api/remitos'
    }
  });
});

module.exports = router;