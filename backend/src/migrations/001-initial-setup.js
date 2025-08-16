// ============================================
// backend/src/migrations/001-initial-setup.js
// Migración inicial con todas las tablas usando UUID
// ============================================
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // ========================================
      // HABILITAR EXTENSIÓN UUID
      // ========================================
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
        { transaction }
      );

      // ========================================
      // TABLA: EMPRESAS
      // ========================================
      await queryInterface.createTable('empresas', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
        },
        nombre: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true
        },
        razon_social: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        cuit: {
          type: Sequelize.STRING(20),
          unique: true,
          allowNull: false
        },
        direccion_fiscal: {
          type: Sequelize.STRING(255)
        },
        telefono_principal: {
          type: Sequelize.STRING(50)
        },
        email_corporativo: {
          type: Sequelize.STRING(150)
        },
        sitio_web: {
          type: Sequelize.STRING(255)
        },
        logo_url: {
          type: Sequelize.STRING(500)
        },
        activa: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        configuracion: {
          type: Sequelize.JSON,
          defaultValue: {}
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: USUARIOS (del sistema)
      // ========================================
      await queryInterface.createTable('usuarios', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
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
        azure_id: {
          type: Sequelize.STRING(255),
          unique: true,
          allowNull: false
        },
        azure_tenant_id: {
          type: Sequelize.STRING(255)
        },
        foto_url: {
          type: Sequelize.STRING(500)
        },
        grupos_ad_ids: {
          type: Sequelize.JSON,
          defaultValue: []
        },
        ultimo_acceso: {
          type: Sequelize.DATE
        },
        activo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        es_super_admin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        empresas_permitidas: {
          type: Sequelize.JSON,
          defaultValue: []
        },
        preferencias: {
          type: Sequelize.JSON,
          defaultValue: {
            tema: 'light',
            idioma: 'es',
            notificaciones_email: true
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: SEDES
      // ========================================
      await queryInterface.createTable('sedes', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
        },
        empresa_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'empresas',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        nombre_sede: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        codigo_sede: {
          type: Sequelize.STRING(20)
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
        codigo_postal: {
          type: Sequelize.STRING(20)
        },
        pais: {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'Argentina'
        },
        telefono: {
          type: Sequelize.STRING(50)
        },
        email_sede: {
          type: Sequelize.STRING(150)
        },
        ip_sede: {
          type: Sequelize.STRING(45)
        },
        es_casa_central: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        activa: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        horario_atencion: {
          type: Sequelize.JSON,
          defaultValue: {
            lunes_viernes: '09:00-18:00',
            sabado: null,
            domingo: null
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: PERSONAL (empleados en sedes)
      // ========================================
      await queryInterface.createTable('personal', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
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
          type: Sequelize.STRING(150)
        },
        telefono: {
          type: Sequelize.STRING(50)
        },
        activo: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: ROLES
      // ========================================
      await queryInterface.createTable('roles', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: PERSONAL_SEDE (relación N:N)
      // ========================================
      await queryInterface.createTable('personal_sede', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
        },
        personal_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'personal',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        sede_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'sedes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        rol_id: {
          type: Sequelize.UUID,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: PROVEEDORES
      // ========================================
      await queryInterface.createTable('proveedores', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: TIPO_SERVICIOS
      // ========================================
      await queryInterface.createTable('tipo_servicios', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: SERVICIOS
      // ========================================
      await queryInterface.createTable('servicios', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
        },
        nombre_servicio: {
          type: Sequelize.STRING(150),
          allowNull: false
        },
        tipo_servicio_id: {
          type: Sequelize.UUID,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: SEDE_SERVICIOS
      // ========================================
      await queryInterface.createTable('sede_servicios', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
        },
        sede_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'sedes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        servicio_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'servicios',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        proveedor_id: {
          type: Sequelize.UUID,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: TIPO_ARTICULOS
      // ========================================
      await queryInterface.createTable('tipo_articulos', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: INVENTARIO
      // ========================================
      await queryInterface.createTable('inventario', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
        },
        tipo_articulo_id: {
          type: Sequelize.UUID,
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
          type: Sequelize.UUID,
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
          type: Sequelize.UUID,
          references: {
            model: 'remitos',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        fecha_devolucion_extendida: {
          type: Sequelize.DATE
        },
        usuario_prestamo_id: {
          type: Sequelize.UUID,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        estado: {
          type: Sequelize.ENUM('disponible', 'en_uso', 'prestado', 'en_transito', 'en_reparacion', 'baja'),
          defaultValue: 'disponible'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // ========================================
      // TABLA: REMITOS
      // ========================================
      await queryInterface.createTable('remitos', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          primaryKey: true
        },
        numero_remito: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false
        },
        fecha: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        sede_origen_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'sedes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        sede_destino_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'sedes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },solicitante_id: {
         type: Sequelize.UUID,
         allowNull: false,
         references: {
           model: 'personal',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'RESTRICT'
       },
       tecnico_asignado_id: {
         type: Sequelize.UUID,
         references: {
           model: 'personal',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'SET NULL'
       },
       creado_por_id: {
         type: Sequelize.UUID,
         allowNull: false,
         references: {
           model: 'usuarios',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'RESTRICT'
       },
       estado: {
         type: Sequelize.ENUM('preparado', 'en_transito', 'entregado', 'confirmado'),
         allowNull: false,
         defaultValue: 'preparado'
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
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       },
       updated_at: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       }
     }, { transaction });

     // ========================================
     // TABLA: REMITO_INVENTARIO
     // ========================================
     await queryInterface.createTable('remito_inventario', {
       id: {
         type: Sequelize.UUID,
         defaultValue: Sequelize.literal('uuid_generate_v4()'),
         primaryKey: true
       },
       remito_id: {
         type: Sequelize.UUID,
         allowNull: false,
         references: {
           model: 'remitos',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
       },
       inventario_id: {
         type: Sequelize.UUID,
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
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       },
       updated_at: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       }
     }, { transaction });

     // ========================================
     // TABLA: HISTORIAL_INVENTARIO
     // ========================================
     await queryInterface.createTable('historial_inventario', {
       id: {
         type: Sequelize.UUID,
         defaultValue: Sequelize.literal('uuid_generate_v4()'),
         primaryKey: true
       },
       inventario_id: {
         type: Sequelize.UUID,
         allowNull: false,
         references: {
           model: 'inventario',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'CASCADE'
       },
       remito_id: {
         type: Sequelize.UUID,
         references: {
           model: 'remitos',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'SET NULL'
       },
       sede_origen_id: {
         type: Sequelize.UUID,
         references: {
           model: 'sedes',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'SET NULL'
       },
       sede_destino_id: {
         type: Sequelize.UUID,
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
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       },
       tipo_movimiento: {
         type: Sequelize.ENUM('ingreso', 'egreso', 'transferencia', 'baja', 'prestamo', 'devolucion'),
         allowNull: false
       },
       usuario_id: {
         type: Sequelize.UUID,
         allowNull: false,
         references: {
           model: 'usuarios',
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
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       },
       updated_at: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       }
     }, { transaction });

     // ========================================
     // TABLA: EXTENSIONES_PRESTAMO
     // ========================================
     await queryInterface.createTable('extensiones_prestamo', {
       id: {
         type: Sequelize.UUID,
         defaultValue: Sequelize.literal('uuid_generate_v4()'),
         primaryKey: true
       },
       inventario_id: {
         type: Sequelize.UUID,
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
         type: Sequelize.UUID,
         allowNull: false,
         references: {
           model: 'personal',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'RESTRICT'
       },
       aprobado_por_id: {
         type: Sequelize.UUID,
         references: {
           model: 'usuarios',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'SET NULL'
       },
       fecha_solicitud: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       },
       updated_at: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
       }
     }, { transaction });

     // ========================================
     // TABLA: AUDITORIA
     // ========================================
     await queryInterface.createTable('auditoria', {
       id: {
         type: Sequelize.UUID,
         defaultValue: Sequelize.literal('uuid_generate_v4()'),
         primaryKey: true
       },
       tabla_afectada: {
         type: Sequelize.STRING(100),
         allowNull: false
       },
       registro_id: {
         type: Sequelize.UUID,
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
         type: Sequelize.UUID,
         references: {
           model: 'usuarios',
           key: 'id'
         },
         onUpdate: 'CASCADE',
         onDelete: 'SET NULL'
       },
       fecha_hora: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
     }, { transaction });

     // ========================================
     // INDICES ADICIONALES
     // ========================================
     
     // Índices para empresas
     await queryInterface.addIndex('empresas', ['cuit'], { 
       unique: true, 
       transaction 
     });
     await queryInterface.addIndex('empresas', ['activa'], { 
       transaction 
     });

     // Índices para usuarios
     await queryInterface.addIndex('usuarios', ['email'], { 
       unique: true, 
       transaction 
     });
     await queryInterface.addIndex('usuarios', ['azure_id'], { 
       unique: true, 
       transaction 
     });
     await queryInterface.addIndex('usuarios', ['activo'], { 
       transaction 
     });

     // Índices para sedes
     await queryInterface.addIndex('sedes', ['empresa_id'], { 
       transaction 
     });
     await queryInterface.addIndex('sedes', ['activa'], { 
       transaction 
     });
     await queryInterface.addIndex('sedes', ['empresa_id', 'codigo_sede'], { 
       unique: true, 
       where: { codigo_sede: { [Sequelize.Op.ne]: null } },
       transaction 
     });

     // Índices para personal_sede
     await queryInterface.addIndex('personal_sede', ['personal_id', 'sede_id', 'activo'], { 
       transaction 
     });

     // Índices para inventario
     await queryInterface.addIndex('inventario', ['service_tag'], { 
       unique: true, 
       transaction 
     });
     await queryInterface.addIndex('inventario', ['sede_actual_id'], { 
       transaction 
     });
     await queryInterface.addIndex('inventario', ['prestamo'], { 
       transaction 
     });
     await queryInterface.addIndex('inventario', ['estado'], { 
       transaction 
     });
     await queryInterface.addIndex('inventario', ['tipo_articulo_id'], { 
       transaction 
     });

     // Índices para remitos
     await queryInterface.addIndex('remitos', ['numero_remito'], { 
       unique: true, 
       transaction 
     });
     await queryInterface.addIndex('remitos', ['estado'], { 
       transaction 
     });
     await queryInterface.addIndex('remitos', ['fecha'], { 
       transaction 
     });
     await queryInterface.addIndex('remitos', ['sede_origen_id', 'sede_destino_id'], { 
       transaction 
     });
     await queryInterface.addIndex('remitos', ['token_confirmacion'], { 
       unique: true, 
       where: { token_confirmacion: { [Sequelize.Op.ne]: null } },
       transaction 
     });

     // Índices para remito_inventario
     await queryInterface.addIndex('remito_inventario', ['remito_id', 'inventario_id'], { 
       unique: true,
       transaction 
     });

     // Índices para historial_inventario
     await queryInterface.addIndex('historial_inventario', ['inventario_id'], { 
       transaction 
     });
     await queryInterface.addIndex('historial_inventario', ['fecha_movimiento'], { 
       transaction 
     });
     await queryInterface.addIndex('historial_inventario', ['tipo_movimiento'], { 
       transaction 
     });
     await queryInterface.addIndex('historial_inventario', ['usuario_id'], { 
       transaction 
     });

     // Índices para extensiones_prestamo
     await queryInterface.addIndex('extensiones_prestamo', ['inventario_id'], { 
       transaction 
     });
     await queryInterface.addIndex('extensiones_prestamo', ['estado'], { 
       transaction 
     });
     await queryInterface.addIndex('extensiones_prestamo', ['fecha_solicitud'], { 
       transaction 
     });

     // Índices para auditoría
     await queryInterface.addIndex('auditoria', ['tabla_afectada', 'registro_id'], { 
       transaction 
     });
     await queryInterface.addIndex('auditoria', ['usuario_id'], { 
       transaction 
     });
     await queryInterface.addIndex('auditoria', ['fecha_hora'], { 
       transaction 
     });

     // Índices para sede_servicios
     await queryInterface.addIndex('sede_servicios', ['sede_id', 'servicio_id', 'activo'], { 
       transaction 
     });

     // ========================================
     // COMMIT TRANSACTION
     // ========================================
     await transaction.commit();
     console.log('✅ Migración completada exitosamente');

   } catch (error) {
     await transaction.rollback();
     console.error('❌ Error en migración:', error);
     throw error;
   }
 },

 down: async (queryInterface, Sequelize) => {
   const transaction = await queryInterface.sequelize.transaction();
   
   try {
     // Eliminar tablas en orden inverso para respetar foreign keys
     await queryInterface.dropTable('auditoria', { transaction });
     await queryInterface.dropTable('extensiones_prestamo', { transaction });
     await queryInterface.dropTable('historial_inventario', { transaction });
     await queryInterface.dropTable('remito_inventario', { transaction });
     await queryInterface.dropTable('remitos', { transaction });
     await queryInterface.dropTable('inventario', { transaction });
     await queryInterface.dropTable('tipo_articulos', { transaction });
     await queryInterface.dropTable('sede_servicios', { transaction });
     await queryInterface.dropTable('servicios', { transaction });
     await queryInterface.dropTable('tipo_servicios', { transaction });
     await queryInterface.dropTable('proveedores', { transaction });
     await queryInterface.dropTable('personal_sede', { transaction });
     await queryInterface.dropTable('roles', { transaction });
     await queryInterface.dropTable('personal', { transaction });
     await queryInterface.dropTable('sedes', { transaction });
     await queryInterface.dropTable('usuarios', { transaction });
     await queryInterface.dropTable('empresas', { transaction });

     await transaction.commit();
     console.log('✅ Rollback completado exitosamente');

   } catch (error) {
     await transaction.rollback();
     console.error('❌ Error en rollback:', error);
     throw error;
   }
 }
};