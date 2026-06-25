const { pool } = require('../config/db');

async function findByUsername(username) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        username,
        name,
        email,
        password_hash,
        status
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
    [username]
  );

  return rows[0] || null;
}

async function getAccessProfile(userId) {
  const [roles] = await pool.execute(
    `
      SELECT
        r.role_key,
        r.role_name
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY r.role_key
    `,
    [userId]
  );

  const [permissions] = await pool.execute(
    `
      SELECT DISTINCT
        p.permission_key
      FROM user_roles ur
      JOIN role_permissions rp ON rp.role_id = ur.role_id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = ?
      ORDER BY p.permission_key
    `,
    [userId]
  );

  const [routes] = await pool.execute(
    `
      SELECT
        r.route_key,
        r.route_name,
        ura.can_read,
        ura.can_write
      FROM user_route_access ura
      JOIN routes r ON r.id = ura.route_id
      WHERE ura.user_id = ?
        AND r.active = 1
      ORDER BY r.route_name
    `,
    [userId]
  );

  return {
    roles: roles.map(role => role.role_key),
    permissions: permissions.map(permission => permission.permission_key),
    routes: routes.map(route => ({
      routeKey: route.route_key,
      routeName: route.route_name,
      canRead: Boolean(route.can_read),
      canWrite: Boolean(route.can_write)
    }))
  };
}

async function updateLastLogin(userId) {
  await pool.execute(
    `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ?
    `,
    [userId]
  );
}

module.exports = {
  findByUsername,
  getAccessProfile,
  updateLastLogin
};