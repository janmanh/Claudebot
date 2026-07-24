function crearPedido({ telefono, productos, total_estimado, notas }) {
  console.log('🛒 Nuevo pedido:', { telefono, productos, total_estimado, notas });
  // Paso 6.4: aquí escribiremos a Google Sheets
  return { exito: true, mensaje: 'Pedido registrado correctamente' };
}

function agendarCita({ telefono, fecha, hora, motivo }) {
  console.log('📅 Nueva cita:', { telefono, fecha, hora, motivo });
  // Paso 6.4: aquí escribiremos a Google Sheets / Calendar
  return { exito: true, mensaje: `Cita agendada para ${fecha} a las ${hora}` };
}

module.exports = { crearPedido, agendarCita };