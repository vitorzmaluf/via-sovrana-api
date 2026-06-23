const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({
      ok: false,
      message: 'Acesso não autorizado. Faça login novamente.'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      username: payload.username,
      role: payload.role || 'internal'
    };

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Sessão expirada ou inválida. Faça login novamente.'
    });
  }
}

module.exports = {
  authRequired
};