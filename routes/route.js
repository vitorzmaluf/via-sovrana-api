const express = require('express');
const jwt = require('jsonwebtoken');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function clean(value) {
  return String(value || '').trim();
}

router.post('/login', (req, res) => {
  const username = clean(req.body.username);
  const password = clean(req.body.password);

  const validUser = process.env.INTERNAL_AUTH_USER;
  const validPass = process.env.INTERNAL_AUTH_PASS;

  if (!validUser || !validPass || !process.env.JWT_SECRET) {
    return res.status(500).json({
      ok: false,
      message: 'Autenticação não configurada no servidor.'
    });
  }

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({
      ok: false,
      message: 'Usuário ou senha inválidos.'
    });
  }

  const token = jwt.sign(
    {
      username,
      role: 'internal'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    }
  );

  res.json({
    ok: true,
    token,
    user: {
      username,
      role: 'internal'
    }
  });
});

router.get('/me', authRequired, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});

module.exports = router;