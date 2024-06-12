const formatRemito = (remito) => {
    return {
      id_remito: remito.id_remito,
      id_sede: remito.id_sede,
      sede_nombre: remito.Sede.nombre,
      solicitante: remito.solicitante,
      fecha_remito: remito.fecha_remito,
      transportista: remito.transportista,
      inventarios: remito.Inventarios.map(inventario => ({
        marca: inventario.marca,
        modelo: inventario.modelo,
        tipo_articulo: inventario.tipo_articulo,
        num_serie: inventario.num_serie,
        service_tag: inventario.service_tag,
        activo: inventario.activo,
        es_prestamo: inventario.RemitoInventario.es_prestamo,
        sede_nombre: inventario.Sede ? inventario.Sede.nombre : null
      }))
    };
  };
  
  const getRemitoInclusions = () => {
    return [
      {
        model: require('../models/Sede'),
        attributes: ["nombre"],
      },
      {
        model: require('../models/Inventario'),
        through: { attributes: ["es_prestamo"] },
        attributes: ["marca", "modelo", "tipo_articulo", "num_serie", "service_tag", "activo"],
        include: [
          {
            model: require('../models/Sede'),
            attributes: ["nombre"]
          }
        ]
      }
    ];
  };
  
  module.exports = {
    formatRemito,
    getRemitoInclusions
  };
  