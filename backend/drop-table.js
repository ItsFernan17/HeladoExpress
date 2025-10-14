const mysql = require('mysql2/promise');

async function dropTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sierraF017',
    database: 'sarita-chuscaj'
  });

  try {
    await connection.execute('DROP TABLE IF EXISTS pedido_detalle_sabor');
    console.log('Tabla pedido_detalle_sabor eliminada exitosamente');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

dropTable();
