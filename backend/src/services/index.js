// ============================================
// backend/src/services/index.js (ACTUALIZADO)
// ============================================
module.exports = {
  authService: require('./authService'),
  emailService: require('./emailService'),
  pdfService: require('./pdfService'),
  empresaService: require('./empresaService'), // ← NUEVO
  sedeService: require('./sedeService'),
  personalService: require('./personalService'),
  inventarioService: require('./inventarioService'),
  remitoService: require('./remitoService'),
  dashboardService: require('./dashboardService')
};