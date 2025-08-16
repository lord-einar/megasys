// ============================================
// backend/src/migrations/001-initial-setup.js
// UUID everywhere + numero_remito secuencial
// ============================================
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const t = await queryInterface.sequelize.transaction();
    try {
      // Extensión para UUID
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
        { transaction: t }
      );

      // Secuencia para numero_remito (independiente del UUID)
      await queryInterface.sequelize.query(
        `CREATE SEQUENCE IF NOT EXISTS remitos_numero_seq
           START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;`,
        { transaction: t }
      );

      // ========== EMPRESAS ==========
      await queryInterface.createTable('empresas', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre: { type: Sequelize.STRING(150), allowNull: false, unique: true },
        razon_social: { type: Sequelize.STRING(200) },
        cuit: { type: Sequelize.STRING(20), unique: true },
        direccion_fiscal: { type: Sequelize.STRING(255) },
        telefono_principal: { type: Sequelize.STRING(50) },
        email_corporativo: { type: Sequelize.STRING(150) },
        sitio_web: { type: Sequelize.STRING(255) },
        logo_url: { type: Sequelize.STRING(500) },
        activa: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        configuracion: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // ========== SEDES ==========
      await queryInterface.createTable('sedes', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        empresa_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'empresas', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        codigo_sede: { type: Sequelize.STRING(50) },
        nombre_sede: { type: Sequelize.STRING(150), allowNull: false },
        direccion: { type: Sequelize.STRING(255), allowNull: false },
        localidad: { type: Sequelize.STRING(100), allowNull: false },
        provincia: { type: Sequelize.STRING(100), allowNull: false },
        pais: { type: Sequelize.STRING(100), allowNull: false, defaultValue: 'Argentina' },
        telefono: { type: Sequelize.STRING(50) },
        ip_sede: { type: Sequelize.STRING(45) },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.addIndex('sedes', ['empresa_id', 'nombre_sede'], {
        unique: true, name: 'uq_sedes_empresa_sede', transaction: t
      });

      // ========== ROLES (para personal_sede) ==========
      await queryInterface.createTable('roles', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        descripcion: { type: Sequelize.TEXT },
        permisos: { type: Sequelize.JSONB, defaultValue: {} },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // ========== PERSONAL (no usa la app) ==========
      await queryInterface.createTable('personal', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre: { type: Sequelize.STRING(100), allowNull: false },
        apellido: { type: Sequelize.STRING(100), allowNull: false },
        email: { type: Sequelize.STRING(150) },
        telefono: { type: Sequelize.STRING(50) },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // ========== PERSONAL_SEDE ==========
      await queryInterface.createTable('personal_sede', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        personal_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'personal', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        sede_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'sedes', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        rol_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'roles', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        fecha_asignacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        fecha_fin: { type: Sequelize.DATE },
        activo: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.addIndex('personal_sede', ['personal_id', 'sede_id', 'rol_id', 'activo'], {
        name: 'idx_personal_sede', transaction: t
      });

      // ========== USUARIOS (los que usan la app) ==========
      await queryInterface.createTable('usuarios', {
        id_user: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre: { type: Sequelize.STRING(100), allowNull: false },
        apellido: { type: Sequelize.STRING(100), allowNull: false },
        email: { type: Sequelize.STRING(180), allowNull: false, unique: true },
        telefono: { type: Sequelize.STRING(50) },
        active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        azure_id: { type: Sequelize.STRING(255), unique: true },
        azure_tenant_id: { type: Sequelize.STRING(255) },
        grupos_ad_ids: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] }, // IDs de grupo de Entra ID
        es_super_admin: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        empresas_permitidas: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        preferencias: { type: Sequelize.JSONB, allowNull: false, defaultValue: { tema: 'light', idioma: 'es', notificaciones_email: true } },
        ultimo_acceso: { type: Sequelize.DATE },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_usuarios_grupos_ad_ids ON usuarios USING GIN (grupos_ad_ids);`,
        { transaction: t }
      );

      // ========== TIPO_ARTICULOS ==========
      await queryInterface.createTable('tipo_articulos', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        descripcion: { type: Sequelize.TEXT },
        requiere_serie: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // ========== INVENTARIO ==========
      await queryInterface.createTable('inventario', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        tipo_articulo_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'tipo_articulos', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        marca: { type: Sequelize.STRING(100), allowNull: false },
        modelo: { type: Sequelize.STRING(100), allowNull: false },
        numero_serie: { type: Sequelize.STRING(150) },
        service_tag: { type: Sequelize.STRING(150), unique: true, allowNull: false },
        activo: { type: Sequelize.BOOLEAN, defaultValue: true },
        sede_actual_id: {
          type: Sequelize.UUID,
          references: { model: 'sedes', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        // préstamo
        prestamo: { type: Sequelize.BOOLEAN, defaultValue: false },
        fecha_devolucion: { type: Sequelize.DATE },
        devuelto: { type: Sequelize.BOOLEAN, defaultValue: false },
        remito_prestamo_id: { type: Sequelize.UUID }, // FK se agrega abajo para evitar ciclo
        fecha_devolucion_extendida: { type: Sequelize.DATE },
        usuario_prestamo_id: {
          type: Sequelize.UUID,
          references: { model: 'personal', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        observaciones_prestamo: { type: Sequelize.TEXT },
        observaciones: { type: Sequelize.TEXT },
        fecha_ingreso: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        estado: {
          type: Sequelize.ENUM('disponible', 'en_uso', 'prestado', 'en_transito', 'en_reparacion', 'baja'),
          defaultValue: 'disponible'
        },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.addIndex('inventario', ['service_tag'], { unique: true, transaction: t });
      await queryInterface.addIndex('inventario', ['sede_actual_id'], { transaction: t });
      await queryInterface.addIndex('inventario', ['prestamo'], { transaction: t });
      await queryInterface.addIndex('inventario', ['estado'], { transaction: t });

      // ========== REMITOS (UUID + numero secuencial) ==========
      await queryInterface.createTable('remitos', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        numero_remito: {
          type: Sequelize.BIGINT, allowNull: false,
          defaultValue: Sequelize.literal(`nextval('remitos_numero_seq')`)
        },
        fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        sede_origen_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'sedes', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        sede_destino_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'sedes', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        solicitante_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'personal', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        tecnico_asignado_id: {
          type: Sequelize.UUID,
          references: { model: 'personal', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        estado: {
          type: Sequelize.ENUM('preparado', 'en_transito', 'entregado', 'confirmado'),
          allowNull: false, defaultValue: 'preparado'
        },
        pdf_entrega_path: { type: Sequelize.STRING(500) },
        pdf_confirmacion_path: { type: Sequelize.STRING(500) },
        fecha_preparacion: { type: Sequelize.DATE },
        fecha_transito: { type: Sequelize.DATE },
        fecha_entrega: { type: Sequelize.DATE },
        fecha_confirmacion: { type: Sequelize.DATE },
        token_confirmacion: { type: Sequelize.STRING(255), unique: true },
        observaciones: { type: Sequelize.TEXT },

        // quién crea el remito (usuario del sistema)
        creado_por_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'usuarios', key: 'id_user' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.addConstraint('remitos', {
        fields: ['numero_remito'], type: 'unique', name: 'uq_remitos_numero', transaction: t
      });

      // ========== REMITO_INVENTARIO ==========
      await queryInterface.createTable('remito_inventario', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        remito_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'remitos', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        inventario_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'inventario', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        cantidad: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        observaciones: { type: Sequelize.TEXT },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // ========== HISTORIAL_INVENTARIO (acciones por usuarios del sistema) ==========
      await queryInterface.createTable('historial_inventario', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        inventario_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'inventario', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        remito_id: {
          type: Sequelize.UUID,
          references: { model: 'remitos', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        sede_origen_id: {
          type: Sequelize.UUID,
          references: { model: 'sedes', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        sede_destino_id: {
          type: Sequelize.UUID,
          references: { model: 'sedes', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        fecha_movimiento: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        tipo_movimiento: {
          type: Sequelize.ENUM('ingreso', 'egreso', 'transferencia', 'baja', 'prestamo', 'devolucion'),
          allowNull: false
        },
        usuario_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'usuarios', key: 'id_user' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        observaciones: { type: Sequelize.TEXT },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // ========== AUDITORIA (hecha por usuarios del sistema) ==========
      await queryInterface.createTable('auditoria', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        tabla_afectada: { type: Sequelize.STRING(100), allowNull: false },
        registro_id: { type: Sequelize.UUID, allowNull: false },
        accion: { type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE'), allowNull: false },
        valores_anteriores: { type: Sequelize.JSONB },
        valores_nuevos: { type: Sequelize.JSONB },
        usuario_id: {
          type: Sequelize.UUID,
          references: { model: 'usuarios', key: 'id_user' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        fecha_hora: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        ip_usuario: { type: Sequelize.STRING(45) },
        user_agent: { type: Sequelize.STRING(500) },
        endpoint: { type: Sequelize.STRING(255) }
      }, { transaction: t });

      await queryInterface.addIndex('auditoria', ['tabla_afectada', 'registro_id'], { transaction: t });
      await queryInterface.addIndex('auditoria', ['usuario_id'], { transaction: t });
      await queryInterface.addIndex('auditoria', ['fecha_hora'], { transaction: t });

      // ========== PROVEEDORES / TIPO_SERVICIOS / SERVICIOS / SEDE_SERVICIOS ==========
      await queryInterface.createTable('proveedores', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre_empresa: { type: Sequelize.STRING(150), allowNull: false, unique: true },
        direccion: { type: Sequelize.STRING(255) },
        telefono: { type: Sequelize.STRING(50) },
        ejecutivo_nombre: { type: Sequelize.STRING(150) },
        ejecutivo_email: { type: Sequelize.STRING(150) },
        ejecutivo_telefono: { type: Sequelize.STRING(50) },
        activo: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.createTable('tipo_servicios', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        descripcion: { type: Sequelize.TEXT },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.createTable('servicios', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        nombre_servicio: { type: Sequelize.STRING(150), allowNull: false },
        tipo_servicio_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'tipo_servicios', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        soporte_nivel1_email: { type: Sequelize.STRING(150) },
        soporte_nivel1_telefono: { type: Sequelize.STRING(50) },
        soporte_nivel2_email: { type: Sequelize.STRING(150) },
        soporte_nivel2_telefono: { type: Sequelize.STRING(50) },
        soporte_nivelN_email: { type: Sequelize.STRING(150) },
        soporte_nivelN_telefono: { type: Sequelize.STRING(50) },
        activo: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      await queryInterface.createTable('sede_servicios', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        sede_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'sedes', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        servicio_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'servicios', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        proveedor_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'proveedores', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        fecha_inicio: { type: Sequelize.DATE, allowNull: false },
        fecha_fin: { type: Sequelize.DATE },
        activo: { type: Sequelize.BOOLEAN, defaultValue: true },
        observaciones: { type: Sequelize.TEXT },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // ========== EXTENSIONES_PRESTAMO ==========
      await queryInterface.createTable('extensiones_prestamo', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
        inventario_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'inventario', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'CASCADE'
        },
        fecha_devolucion_original: { type: Sequelize.DATE, allowNull: false },
        fecha_devolucion_nueva: { type: Sequelize.DATE, allowNull: false },
        motivo: { type: Sequelize.TEXT, allowNull: false },
        solicitante_id: {
          type: Sequelize.UUID, allowNull: false,
          references: { model: 'personal', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'RESTRICT'
        },
        aprobado_por_id: {
          type: Sequelize.UUID,
          references: { model: 'usuarios', key: 'id_user' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        fecha_solicitud: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        fecha_aprobacion: { type: Sequelize.DATE },
        estado: { type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada'), defaultValue: 'pendiente' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }, { transaction: t });

      // FK pendiente: inventario.remito_prestamo_id -> remitos.id (evitamos ciclo)
      await queryInterface.addConstraint('inventario', {
        fields: ['remito_prestamo_id'],
        type: 'foreign key',
        name: 'fk_inventario_remito_prestamo',
        references: { table: 'remitos', field: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
        transaction: t
      });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('inventario', 'fk_inventario_remito_prestamo', { transaction: t });

      await queryInterface.dropTable('extensiones_prestamo', { transaction: t });
      await queryInterface.dropTable('sede_servicios', { transaction: t });
      await queryInterface.dropTable('servicios', { transaction: t });
      await queryInterface.dropTable('tipo_servicios', { transaction: t });
      await queryInterface.dropTable('proveedores', { transaction: t });
      await queryInterface.dropTable('auditoria', { transaction: t });
      await queryInterface.dropTable('historial_inventario', { transaction: t });
      await queryInterface.dropTable('remito_inventario', { transaction: t });
      await queryInterface.dropTable('remitos', { transaction: t });
      await queryInterface.dropTable('inventario', { transaction: t });
      await queryInterface.dropTable('tipo_articulos', { transaction: t });
      await queryInterface.dropTable('usuarios', { transaction: t });
      await queryInterface.dropTable('personal_sede', { transaction: t });
      await queryInterface.dropTable('personal', { transaction: t });
      await queryInterface.dropTable('roles', { transaction: t });
      await queryInterface.dropTable('sedes', { transaction: t });
      await queryInterface.dropTable('empresas', { transaction: t });

      await queryInterface.sequelize.query(`DROP SEQUENCE IF EXISTS remitos_numero_seq;`, { transaction: t });
      // dejamos pgcrypto instalada
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
};
