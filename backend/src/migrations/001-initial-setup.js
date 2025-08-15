// ============================================
// backend/src/migrations/001-initial-setup.js
// ============================================
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla de roles
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      permisos: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de sedes
    await queryInterface.createTable('sedes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_empresa: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      nombre_sede: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      localidad: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      provincia: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pais: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Argentina'
      },
      telefono: {
        type: Sequelize.STRING(50)
      },
      ip_sede: {
        type: Sequelize.STRING(45)
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índice único para nombre_empresa + nombre_sede
    await queryInterface.addIndex('sedes', ['nombre_empresa', 'nombre_sede'], {
      unique: true,
      name: 'sedes_unique_empresa_sede'
    });

    // Crear tabla de personal
    await queryInterface.createTable('personal', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      telefono: {
        type: Sequelize.STRING(50)
      },
      azure_id: {
        type: Sequelize.STRING(255),
        unique: true
      },
      foto_url: {
        type: Sequelize.STRING(500)
      },
      grupos_ad: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla personal_sede
    await queryInterface.createTable('personal_sede', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      personal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'personal',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sede_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sedes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rol_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fecha_fin: {
        type: Sequelize.DATE
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla tipo_articulos
    await queryInterface.createTable('tipo_articulos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      requiere_serie: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla inventario
    await queryInterface.createTable('inventario', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tipo_articulo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipo_articulos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      marca: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      modelo: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      numero_serie: {
        type: Sequelize.STRING(150)
      },
      service_tag: {
        type: Sequelize.STRING(150),
        unique: true,
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      sede_actual_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sedes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      prestamo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fecha_devolucion: {
        type: Sequelize.DATE
      },
      devuelto: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      remito_prestamo_id: {
        type: Sequelize.INTEGER
      },
      fecha_devolucion_extendida: {
        type: Sequelize.DATE
      },
      usuario_prestamo_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'personal',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      observaciones_prestamo: {
        type: Sequelize.TEXT
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      fecha_ingreso: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      estado: {
        type: Sequelize.ENUM('disponible', 'en_uso', 'prestado', 'en_transito', 'en_reparacion', 'baja'),
        defaultValue: 'disponible'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para inventario
    await queryInterface.addIndex('inventario', ['service_tag'], { unique: true });
    await queryInterface.addIndex('inventario', ['sede_actual_id']);
    await queryInterface.addIndex('inventario', ['prestamo']);
    await queryInterface.addIndex('inventario', ['estado']);

    // Crear tabla remitos
    await queryInterface.createTable('remitos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero_remito: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      sede_origen_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sedes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      sede_destino_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sedes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      solicitante_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'personal',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      estado: {
        type: Sequelize.ENUM('preparado', 'en_transito', 'entregado', 'confirmado'),
        defaultValue: 'preparado',
        allowNull: false
      },
      tecnico_asignado_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'personal',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      pdf_entrega_path: {
        type: Sequelize.STRING(500)
      },
      pdf_confirmacion_path: {
        type: Sequelize.STRING(500)
      },
      fecha_preparacion: {
        type: Sequelize.DATE
      },
      fecha_transito: {
        type: Sequelize.DATE
      },
      fecha_entrega: {
        type: Sequelize.DATE
      },
      fecha_confirmacion: {
        type: Sequelize.DATE
      },
      token_confirmacion: {
        type: Sequelize.STRING(255),
        unique: true
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Tabla intermedia remito_inventario
    await queryInterface.createTable('remito_inventario', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      remito_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'remitos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      inventario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventario',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla historial_inventario
    await queryInterface.createTable('historial_inventario', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      inventario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'inventario',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      remito_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'remitos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sede_origen_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sedes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sede_destino_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sedes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_movimiento: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      tipo_movimiento: {
        type: Sequelize.ENUM('ingreso', 'egreso', 'transferencia', 'baja', 'prestamo', 'devolucion'),
        allowNull: false
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'personal',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla auditoria
    await queryInterface.createTable('auditoria', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tabla_afectada: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      registro_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      accion: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE'),
        allowNull: false
      },
      valores_anteriores: {
        type: Sequelize.JSON
      },
      valores_nuevos: {
        type: Sequelize.JSON
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'personal',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_hora: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      ip_usuario: {
        type: Sequelize.STRING(45)
      },
      user_agent: {
        type: Sequelize.STRING(500)
      },
      endpoint: {
        type: Sequelize.STRING(255)
      }
    });

    // Índices para auditoría
    await queryInterface.addIndex('auditoria', ['tabla_afectada', 'registro_id']);
    await queryInterface.addIndex('auditoria', ['usuario_id']);
    await queryInterface.addIndex('auditoria', ['fecha_hora']);

// backend/src/migrations/001-initial-setup.js
// AGREGAR antes del final del método 'up':

// Crear tabla proveedores
await queryInterface.createTable('proveedores', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_empresa: {
    type: Sequelize.STRING(150),
    allowNull: false,
    unique: true
  },
  direccion: {
    type: Sequelize.STRING(255)
  },
  telefono: {
    type: Sequelize.STRING(50)
  },
  ejecutivo_nombre: {
    type: Sequelize.STRING(150)
  },
  ejecutivo_email: {
    type: Sequelize.STRING(150)
  },
  ejecutivo_telefono: {
    type: Sequelize.STRING(50)
  },
  activo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

// Crear tabla tipo_servicios
await queryInterface.createTable('tipo_servicios', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: Sequelize.TEXT
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

// Crear tabla servicios
await queryInterface.createTable('servicios', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_servicio: {
    type: Sequelize.STRING(150),
    allowNull: false
  },
  tipo_servicio_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'tipo_servicios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  soporte_nivel1_email: {
    type: Sequelize.STRING(150)
  },
  soporte_nivel1_telefono: {
    type: Sequelize.STRING(50)
  },
  soporte_nivel2_email: {
    type: Sequelize.STRING(150)
  },
  soporte_nivel2_telefono: {
    type: Sequelize.STRING(50)
  },
  soporte_nivelN_email: {
    type: Sequelize.STRING(150)
  },
  soporte_nivelN_telefono: {
    type: Sequelize.STRING(50)
  },
  activo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

// Crear tabla sede_servicios
await queryInterface.createTable('sede_servicios', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sede_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  servicio_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'servicios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  proveedor_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  fecha_inicio: {
    type: Sequelize.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: Sequelize.DATE
  },
  activo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  observaciones: {
    type: Sequelize.TEXT
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

// Crear tabla extensiones_prestamo
await queryInterface.createTable('extensiones_prestamo', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inventario_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'inventario',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  fecha_devolucion_original: {
    type: Sequelize.DATE,
    allowNull: false
  },
  fecha_devolucion_nueva: {
    type: Sequelize.DATE,
    allowNull: false
  },
  motivo: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  solicitante_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'personal',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  aprobado_por_id: {
    type: Sequelize.INTEGER,
    references: {
      model: 'personal',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  fecha_solicitud: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  fecha_aprobacion: {
    type: Sequelize.DATE
  },
  estado: {
    type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada'),
    defaultValue: 'pendiente'
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});

// Y agregar en el método down:
await queryInterface.dropTable('extensiones_prestamo');
await queryInterface.dropTable('sede_servicios');
await queryInterface.dropTable('servicios');
await queryInterface.dropTable('tipo_servicios');
await queryInterface.dropTable('proveedores');
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar tablas en orden inverso
    await queryInterface.dropTable('auditoria');
    await queryInterface.dropTable('historial_inventario');
    await queryInterface.dropTable('remito_inventario');
    await queryInterface.dropTable('remitos');
    await queryInterface.dropTable('inventario');
    await queryInterface.dropTable('tipo_articulos');
    await queryInterface.dropTable('personal_sede');
    await queryInterface.dropTable('personal');
    await queryInterface.dropTable('sedes');
    await queryInterface.dropTable('roles');
  }
};