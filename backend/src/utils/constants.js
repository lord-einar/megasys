// ============================================
// backend/src/utils/constants.js
// ============================================
module.exports = {
  // Estados de remito
  REMITO_ESTADOS: {
    PREPARADO: 'preparado',
    EN_TRANSITO: 'en_transito',
    ENTREGADO: 'entregado',
    CONFIRMADO: 'confirmado'
  },
  
  // Estados de inventario
  INVENTARIO_ESTADOS: {
    DISPONIBLE: 'disponible',
    EN_USO: 'en_uso',
    PRESTADO: 'prestado',
    EN_TRANSITO: 'en_transito',
    EN_REPARACION: 'en_reparacion',
    BAJA: 'baja'
  },
  
  // Tipos de movimiento
  TIPO_MOVIMIENTO: {
    INGRESO: 'ingreso',
    EGRESO: 'egreso',
    TRANSFERENCIA: 'transferencia',
    BAJA: 'baja',
    PRESTAMO: 'prestamo',
    DEVOLUCION: 'devolucion'
  },
  
  // Estados de extensión de préstamo
  EXTENSION_ESTADOS: {
    PENDIENTE: 'pendiente',
    APROBADA: 'aprobada',
    RECHAZADA: 'rechazada'
  },
  
  // Acciones de auditoría
  AUDIT_ACTIONS: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  },
  
  // Grupos de AD
  AD_GROUPS: {
    INFRAESTRUCTURA: 'Infraestructura',
    SOPORTE: 'Soporte',
    MESA_AYUDA: 'Mesa de ayuda'
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  // Configuración de archivos
  FILE_CONFIG: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
    PDF_DIR: './uploads/pdfs',
    TEMP_DIR: './uploads/temp'
  },
  
  // Configuración de email
  EMAIL_CONFIG: {
    MAX_RETRY: 3,
    RETRY_DELAY: 5000
  }
};