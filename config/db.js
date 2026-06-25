const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  charset: 'utf8mb4'
});

async function testConnection() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}

module.exports = {
  pool,
  testConnection
};