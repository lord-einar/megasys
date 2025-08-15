// ============================================
// backend/src/models/associations.js (ACTUALIZADO)
// ============================================
const Empresa = require('./Empresa');
const Sede = require('./Sede');
const Personal = require('./Personal');
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const PersonalSede = require('./PersonalSede');
const Proveedor = require('./Proveedor');
const TipoServicio = require('./TipoServicio');
const Servicio = require('./Servicio');
const SedeServicio = require('./SedeServicio');
const TipoArticulo = require('./TipoArticulo');
const Inventario = require('./Inventario');
const Remito = require('./Remito');
const RemitoInventario = require('./RemitoInventario');
const HistorialInventario = require('./HistorialInventario');
const ExtensionPrestamo = require('./ExtensionPrestamo');
const Auditoria = require('./Auditoria');

// ============================================
// Relaciones Empresa - Sede
// ============================================

// Una empresa tiene múltiples sedes
Empresa.hasMany(Sede, {
  foreignKey: 'empresa_id',
  as: 'sedes'
});

Sede.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
  as: 'empresa'
});

// ============================================
// Relaciones Sede - Personal (a través de PersonalSede)
// ============================================

// Personal puede estar asignado a múltiples sedes con diferentes roles
Personal.belongsToMany(Sede, {
  through: PersonalSede,
  foreignKey: 'personal_id',
  otherKey: 'sede_id',
  as: 'sedes_asignadas'
});

Sede.belongsToMany(Personal, {
  through: PersonalSede,
  foreignKey: 'sede_id',
  otherKey: 'personal_id',
  as: 'personal_asignado'
});

// PersonalSede pertenece a Personal, Sede y Rol
PersonalSede.belongsTo(Personal, {
  foreignKey: 'personal_id',
  as: 'persona'
});

PersonalSede.belongsTo(Sede, {
  foreignKey: 'sede_id',
  as: 'sede'
});

PersonalSede.belongsTo(Rol, {
  foreignKey: 'rol_id',
  as: 'rol'
});

// ============================================
// Relaciones Usuario (Sistema)
// ============================================

// Usuario puede acceder a múltiples empresas (many-to-many implícito a través de empresas_permitidas)
// No necesita tabla intermedia ya que usamos JSON array

// ============================================
// Relaciones Servicios
// ============================================

// Un tipo de servicio puede tener múltiples servicios
TipoServicio.hasMany(Servicio, {
  foreignKey: 'tipo_servicio_id',
  as: 'servicios'
});

Servicio.belongsTo(TipoServicio, {
  foreignKey: 'tipo_servicio_id',
  as: 'tipo'
});

// Sede puede tener múltiples servicios con diferentes proveedores
Sede.belongsToMany(Servicio, {
  through: SedeServicio,
  foreignKey: 'sede_id',
  otherKey: 'servicio_id',
  as: 'servicios'
});

Servicio.belongsToMany(Sede, {
  through: SedeServicio,
  foreignKey: 'servicio_id',
  otherKey: 'sede_id',
  as: 'sedes'
});

// SedeServicio pertenece a Sede, Servicio y Proveedor
SedeServicio.belongsTo(Sede, {
  foreignKey: 'sede_id',
  as: 'sede'
});

SedeServicio.belongsTo(Servicio, {
  foreignKey: 'servicio_id',
  as: 'servicio'
});

SedeServicio.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});

// Un proveedor puede dar múltiples servicios
Proveedor.hasMany(SedeServicio, {
  foreignKey: 'proveedor_id',
  as: 'servicios_prestados'
});

// ============================================
// Relaciones Inventario
// ============================================

// Un tipo de artículo puede tener múltiples items en inventario
TipoArticulo.hasMany(Inventario, {
  foreignKey: 'tipo_articulo_id',
  as: 'items'
});

Inventario.belongsTo(TipoArticulo, {
  foreignKey: 'tipo_articulo_id',
  as: 'tipo'
});

// Un inventario está en una sede
Inventario.belongsTo(Sede, {
  foreignKey: 'sede_actual_id',
  as: 'sede_actual'
});

Sede.hasMany(Inventario, {
  foreignKey: 'sede_actual_id',
  as: 'inventarios'
});

// Un inventario puede estar prestado a personal
Inventario.belongsTo(Personal, {
  foreignKey: 'usuario_prestamo_id',
  as: 'usuario_prestamo'
});

Personal.hasMany(Inventario, {
  foreignKey: 'usuario_prestamo_id',
  as: 'items_prestados'
});

// Un inventario puede tener un remito de préstamo
Inventario.belongsTo(Remito, {
  foreignKey: 'remito_prestamo_id',
  as: 'remito_prestamo'
});

// ============================================
// Relaciones Remitos
// ============================================

// Un remito tiene sede origen y destino
Remito.belongsTo(Sede, {
  foreignKey: 'sede_origen_id',
  as: 'sede_origen'
});

Remito.belongsTo(Sede, {
  foreignKey: 'sede_destino_id',
  as: 'sede_destino'
});

Sede.hasMany(Remito, {
  foreignKey: 'sede_origen_id',
  as: 'remitos_enviados'
});

Sede.hasMany(Remito, {
  foreignKey: 'sede_destino_id',
  as: 'remitos_recibidos'
});

// Un remito es creado por un USUARIO del sistema (no personal)
Remito.belongsTo(Usuario, {
  foreignKey: 'solicitante_id',
  as: 'solicitante'
});

// Un remito puede tener un técnico asignado (que es personal, no usuario)
Remito.belongsTo(Personal, {
  foreignKey: 'tecnico_asignado_id',
  as: 'tecnico'
});

Usuario.hasMany(Remito, {
  foreignKey: 'solicitante_id',
  as: 'remitos_solicitados'
});

Personal.hasMany(Remito, {
  foreignKey: 'tecnico_asignado_id',
  as: 'remitos_asignados'
});

// Un remito puede tener múltiples items de inventario
Remito.belongsToMany(Inventario, {
  through: RemitoInventario,
  foreignKey: 'remito_id',
  otherKey: 'inventario_id',
  as: 'items'
});

Inventario.belongsToMany(Remito, {
  through: RemitoInventario,
  foreignKey: 'inventario_id',
  otherKey: 'remito_id',
  as: 'remitos'
});

// ============================================
// Relaciones Historial Inventario
// ============================================

// Un inventario tiene múltiples historiales
Inventario.hasMany(HistorialInventario, {
  foreignKey: 'inventario_id',
  as: 'historial'
});

HistorialInventario.belongsTo(Inventario, {
  foreignKey: 'inventario_id',
  as: 'inventario'
});

// Un historial puede tener remito asociado
HistorialInventario.belongsTo(Remito, {
  foreignKey: 'remito_id',
  as: 'remito'
});

// Un historial tiene sede origen y destino
HistorialInventario.belongsTo(Sede, {
  foreignKey: 'sede_origen_id',
  as: 'sede_origen'
});

HistorialInventario.belongsTo(Sede, {
  foreignKey: 'sede_destino_id',
  as: 'sede_destino'
});

// Un historial es registrado por un USUARIO del sistema
HistorialInventario.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

Usuario.hasMany(HistorialInventario, {
  foreignKey: 'usuario_id',
  as: 'movimientos_realizados'
});

// ============================================
// Relaciones Extensiones de Préstamo
// ============================================

// Un inventario puede tener múltiples extensiones de préstamo
Inventario.hasMany(ExtensionPrestamo, {
  foreignKey: 'inventario_id',
  as: 'extensiones'
});

ExtensionPrestamo.belongsTo(Inventario, {
  foreignKey: 'inventario_id',
  as: 'inventario'
});

// Una extensión es solicitada por personal
ExtensionPrestamo.belongsTo(Personal, {
  foreignKey: 'solicitante_id',
  as: 'solicitante'
});

// Una extensión es aprobada por un USUARIO del sistema
ExtensionPrestamo.belongsTo(Usuario, {
  foreignKey: 'aprobado_por_id',
  as: 'aprobador'
});

Personal.hasMany(ExtensionPrestamo, {
  foreignKey: 'solicitante_id',
  as: 'extensiones_solicitadas'
});

Usuario.hasMany(ExtensionPrestamo, {
  foreignKey: 'aprobado_por_id',
  as: 'extensiones_aprobadas'
});

// ============================================
// Relaciones Auditoría
// ============================================

// Una auditoría es realizada por un USUARIO del sistema
Auditoria.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

Usuario.hasMany(Auditoria, {
  foreignKey: 'usuario_id',
  as: 'acciones_auditadas'
});

// ============================================
// Exportar todas las asociaciones
// ============================================

module.exports = {
  Empresa,
  Sede,
  Personal,
  Usuario,
  Rol,
  PersonalSede,
  Proveedor,
  TipoServicio,
  Servicio,
  SedeServicio,
  TipoArticulo,
  Inventario,
  Remito,
  RemitoInventario,
  HistorialInventario,
  ExtensionPrestamo,
  Auditoria
};