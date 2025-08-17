// ============================================
// backend/src/controllers/index.js (ACTUALIZADO)
// ============================================
module.exports = {
  authController: require('./authController'),
  empresaController: require('./empresaController'), // ← NUEVO
  sedeController: require('./sedeController'),
  personalController: require('./personalController'),
  inventarioController: require('./inventarioController'),
  remitoController: require('./remitoController'),
  dashboardController: require('./dashboardController')
};