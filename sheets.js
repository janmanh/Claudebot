const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const credenciales = require('./credenciales-google.json');

const auth = new JWT({
  email: credenciales.client_email,
  key: credenciales.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);

async function agregarPedido({ telefono, productos, total_estimado, notas }) {
  await doc.loadInfo();
  const hoja = doc.sheetsByTitle['Pedidos'];
  await hoja.addRow({
    Fecha: new Date().toLocaleString('es-MX'),
    Telefono: telefono,
    Productos: productos,
    Total: total_estimado || '',
    Notas: notas || '',
  });
}

async function agregarCita({ telefono, fecha, hora, motivo }) {
  await doc.loadInfo();
  const hoja = doc.sheetsByTitle['Citas'];
  await hoja.addRow({
    Telefono: telefono,
    Fecha: fecha,
    Hora: hora,
    Motivo: motivo || '',
  });
}

module.exports = { agregarPedido, agregarCita };