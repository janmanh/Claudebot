const { agregarPedido, agregarCita } = require('./sheets.js');

async function crearPedido({ telefono, productos, total_estimado, notas }) {
  console.log('🛒 Nuevo pedido:', { telefono, productos, total_estimado, notas });
  try {
    await agregarPedido({ telefono, productos, total_estimado, notas });
    return { exito: true, mensaje: 'Pedido registrado correctamente' };
  } catch (error) {
    console.error('Error guardando pedido en Sheets:', error);
    return { exito: false, mensaje: 'Hubo un problema registrando el pedido' };
  }
}

async function agendarCita({ telefono, fecha, hora, motivo }) {
  console.log('📅 Nueva cita:', { telefono, fecha, hora, motivo });
  try {
    await agregarCita({ telefono, fecha, hora, motivo });
    return { exito: true, mensaje: `Cita agendada para ${fecha} a las ${hora}` };
  } catch (error) {
    console.error('Error guardando cita en Sheets:', error);
    return { exito: false, mensaje: 'Hubo un problema agendando la cita' };
  }
}

module.exports = { crearPedido, agendarCita };