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
      id: payload.id || payload.userId,
      username: payload.username,
      name: payload.name,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      routes: payload.routes || []
    };

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Sessão expirada ou inválida. Faça login novamente.'
    });
  }
}

function requirePermission(permissionKey) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const permissions = req.user?.permissions || [];

    if (roles.includes('owner') || permissions.includes(permissionKey)) {
      return next();
    }

    return res.status(403).json({
      ok: false,
      message: 'Você não tem permissão para executar esta ação.'
    });
  };
}

function requireAnyRole(...roleKeys) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];

    if (roles.includes('owner')) {
      return next();
    }

    const allowed = roleKeys.some((role) => roles.includes(role));

    if (!allowed) {
      return res.status(403).json({
        ok: false,
        message: 'Seu perfil não permite acessar este recurso.'
      });
    }

    next();
  };
}

module.exports = {
  authRequired,
  requirePermission,
  requireAnyRole
};