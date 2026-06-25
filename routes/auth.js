const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { authRequired } = require('../middleware/auth');
const UserRepository = require('../repositories/UserRepository');

const router = express.Router();

function clean(value) {
  return String(value || '').trim();
}

router.post('/login', async (req, res, next) => {
  try {
    const username = clean(req.body.username);
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Informe usuário e senha.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        ok: false,
        message: 'JWT_SECRET não configurado no servidor.'
      });
    }

    const user = await UserRepository.findByUsername(username);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        ok: false,
        message: 'Usuário ou senha inválidos.'
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        message: 'Usuário ou senha inválidos.'
      });
    }

    const access = await UserRepository.getAccessProfile(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        name: user.name,
        roles: access.roles,
        permissions: access.permissions,
        routes: access.routes
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    );

    await UserRepository.updateLastLogin(user.id);

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
        routes: access.routes
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authRequired, (req, res) => {
  return res.json({
    ok: true,
    user: req.user
  });
});

module.exports = router;