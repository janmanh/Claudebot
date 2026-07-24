const Database = require('better-sqlite3');
const db = new Database('conversaciones.db');

// Tabla: guarda cada mensaje (del usuario o del bot) por número de teléfono
db.exec(`
  CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telefono TEXT NOT NULL,
    rol TEXT NOT NULL,       -- 'user' o 'assistant'
    contenido TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function guardarMensaje(telefono, rol, contenido) {
  const stmt = db.prepare('INSERT INTO mensajes (telefono, rol, contenido) VALUES (?, ?, ?)');
  stmt.run(telefono, rol, contenido);
}

function obtenerHistorial(telefono, limite = 20) {
  const stmt = db.prepare(`
    SELECT rol, contenido FROM mensajes
    WHERE telefono = ?
    ORDER BY id DESC
    LIMIT ?
  `);
  const filas = stmt.all(telefono, limite);
  return filas.reverse().map(f => ({ role: f.rol, content: f.contenido }));
}

module.exports = { guardarMensaje, obtenerHistorial };