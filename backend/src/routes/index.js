// ============================================
// backend/src/routes/index.js (ACTUALIZADO)
// ============================================
const router = require('express').Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const empresaRoutes = require('./empresaRoutes'); // ← NUEVO
const sedeRoutes = require('./sedeRoutes');
const personalRoutes = require('./personalRoutes');
const inventarioRoutes = require('./inventarioRoutes');
const remitoRoutes = require('./remitoRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/empresas', empresaRoutes); // ← NUEVO
router.use('/sedes', sedeRoutes);
router.use('/personal', personalRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/remitos', remitoRoutes);
router.use('/dashboard', dashboardRoutes);

// Ruta raíz de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Megasys v1.0',
    endpoints: {
      auth: '/api/auth',
      empresas: '/api/empresas', // ← NUEVO
      sedes: '/api/sedes',
      personal: '/api/personal',
      inventario: '/api/inventario',
      remitos: '/api/remitos',
      dashboard: '/api/dashboard'
    }
  });
});

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;