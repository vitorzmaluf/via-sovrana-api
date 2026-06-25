require('dotenv').config();

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function main() {
  const username = process.argv[2] || 'vitor';
  const password = process.argv[3] || 'senha';
  const name = process.argv[4] || 'Vitor';

  const passwordHash = await bcrypt.hash(password, 10);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.execute(
      `
        INSERT INTO users (username, name, password_hash, status)
        VALUES (?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          password_hash = VALUES(password_hash),
          status = 'active',
          updated_at = CURRENT_TIMESTAMP
      `,
      [username, name, passwordHash]
    );

    const [users] = await conn.execute(
      `
        SELECT id
        FROM users
        WHERE username = ?
        LIMIT 1
      `,
      [username]
    );

    if (!users.length) {
      throw new Error('Usuário não encontrado após insert.');
    }

    const userId = users[0].id;

    const [roles] = await conn.execute(
      `
        SELECT id
        FROM roles
        WHERE role_key = 'owner'
        LIMIT 1
      `
    );

    if (!roles.length) {
      throw new Error('Perfil owner não encontrado. Rode o seed do banco antes.');
    }

    const ownerRoleId = roles[0].id;

    await conn.execute(
      `
        INSERT IGNORE INTO user_roles (user_id, role_id)
        VALUES (?, ?)
      `,
      [userId, ownerRoleId]
    );

    const [routes] = await conn.execute(
      `
        SELECT id
        FROM routes
        WHERE route_key = 'rota_castelo'
        LIMIT 1
      `
    );

    if (routes.length) {
      await conn.execute(
        `
          INSERT INTO user_route_access (
            user_id,
            route_id,
            can_read,
            can_write
          )
          VALUES (?, ?, 1, 1)
          ON DUPLICATE KEY UPDATE
            can_read = 1,
            can_write = 1,
            updated_at = CURRENT_TIMESTAMP
        `,
        [userId, routes[0].id]
      );
    }

    await conn.commit();

    console.log('Usuário criado/atualizado com sucesso.');
    console.log(`Usuário: ${username}`);
    console.log(`Nome: ${name}`);
    console.log('Perfil: owner');
    console.log('Acesso: Rota Castelo');
  } catch (error) {
    await conn.rollback();

    console.error('Erro ao criar usuário admin:');
    console.error(error);

    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

main();