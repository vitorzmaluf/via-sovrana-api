const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { pool } = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function clean(value) {
  return String(value || '').trim();
}

async function loadUserAccess(userId) {
  const [roles] = await pool.execute(
    `
    SELECT r.role_key, r.role_name
    FROM user_roles ur
    INNER JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = ?
    ORDER BY r.id
    `,
    [userId]
  );

  const [permissions] = await pool.execute(
    `
    SELECT DISTINCT p.permission_key
    FROM user_roles ur
    INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
    INNER JOIN permissions p ON p.id = rp.permission_id
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
    INNER JOIN routes r ON r.id = ura.route_id
    WHERE ura.user_id = ?
      AND r.active = 1
    ORDER BY r.id
    `,
    [userId]
  );

  return {
    roles: roles.map((r) => r.role_key),
    permissions: permissions.map((p) => p.permission_key),
    routes: routes.map((r) => ({
      routeKey: r.route_key,
      routeName: r.route_name,
      canRead: Boolean(r.can_read),
      canWrite: Boolean(r.can_write),
    })),
  };
}

async function loadUserById(userId) {
  const [rows] = await pool.execute(
    `
    SELECT id, username, name, email, status
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

router.post('/login', async (req, res, next) => {
  try {
    const username = clean(req.body.username);
    const password = clean(req.body.password);

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Informe usuário e senha.',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        ok: false,
        message: 'JWT_SECRET não configurado no servidor.',
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT id, username, name, email, password_hash, status
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuário ou senha inválidos.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Usuário desativado.',
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        message: 'Usuário ou senha inválidos.',
      });
    }

    const access = await loadUserAccess(user.id);

    const tokenPayload = {
      id: user.id,
      userId: user.id,
      username: user.username,
      name: user.name,
      roles: access.roles,
      permissions: access.permissions,
      routes: access.routes,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    await pool.execute(
      `
      UPDATE users
      SET last_login_at = NOW(), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [user.id]
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: access.roles,
        permissions: access.permissions,
        routes: access.routes,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await loadUserById(req.user.id);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        ok: false,
        message: 'Sessão inválida. Faça login novamente.',
      });
    }

    const access = await loadUserAccess(user.id);

    return res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: access.roles,
        permissions: access.permissions,
        routes: access.routes,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;