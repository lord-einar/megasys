// ============================================
// backend/server.js
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { sequelize, syncDatabase } = require('./src/models');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middleware/errorHandler');
const { logger } = require('./src/utils/logger');
const cronJobs = require('./src/jobs');

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// Middlewares globales
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Servir archivos estáticos (PDFs, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// Rutas
// ============================================
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// Manejo de errores
// ============================================
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// ============================================
// Inicialización del servidor
// ============================================
const startServer = async () => {
  try {
    // 1. Verificar conexión a la base de datos
    await sequelize.authenticate();
    logger.info('✅ Conexión a la base de datos establecida');
    
    // 2. Sincronización condicional por ambiente
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Base de datos sincronizada (desarrollo)');
    } else {
      logger.info('📝 Producción: use npm run migrate para actualizar esquema');
    }
    
    // 3. Iniciar trabajos programados
    cronJobs.start();
    logger.info('✅ CRON jobs iniciados');
    
    // 4. Levantar servidor HTTP
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado`);
      logger.info(`📍 Puerto: ${PORT}`);
      logger.info(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: ${process.env.BACKEND_PUBLIC_URL || `http://localhost:${PORT}`}`);
    });
    
  } catch (error) {
    logger.error('❌ Error fatal al iniciar:', error.message);
    await sequelize.close();
    process.exit(1);
  }
};


// Manejo de señales para cerrar correctamente
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;