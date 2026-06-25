require('dotenv').config();

const { testConnection, pool } = require('../config/db');

async function main() {
  try {
    const ok = await testConnection();

    if (ok) {
      console.log('Conexão com MySQL OK.');
    } else {
      console.log('Conexão feita, mas retorno inesperado.');
    }
  } catch (error) {
    console.error('Erro ao conectar no MySQL:');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();