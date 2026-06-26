const { ErrorResponse } = require('../dto');

function validateFreightFields({ cityKey, zoneKey, pesoKg }) {
  const errors = [];

  if (!cityKey) {
    errors.push({
      field: 'cityKey',
      message: 'Cidade é obrigatória.',
    });
  }

  if (!zoneKey) {
    errors.push({
      field: 'zoneKey',
      message: 'Zona é obrigatória.',
    });
  }

  const peso = Number(pesoKg);

  if (!pesoKg || Number.isNaN(peso) || peso <= 0) {
    errors.push({
      field: 'pesoKg',
      message: 'Peso deve ser um número maior que zero.',
    });
  }

  return errors;
}

function validateQuote(req, res, next) {
  const errors = validateFreightFields(req.body);

  if (errors.length) {
    return res
      .status(400)
      .json(new ErrorResponse('Dados inválidos', 'VALIDATION_ERROR', errors));
  }

  next();
}

function validateSimulateDay(req, res, next) {
  const { clientes } = req.body;
  const errors = [];

  if (!Array.isArray(clientes) || clientes.length === 0) {
    errors.push({
      field: 'clientes',
      message: 'Envie ao menos um cliente.',
    });

    return res
      .status(400)
      .json(new ErrorResponse('Dados inválidos', 'VALIDATION_ERROR', errors));
  }

  clientes.forEach((c, i) => {
    const fieldErrors = validateFreightFields({
      cityKey: c.cityKey,
      zoneKey: c.zoneKey,
      pesoKg: c.pesoKg,
    });

    fieldErrors.forEach((e) => {
      errors.push({
        field: `clientes[${i}].${e.field}`,
        message: e.message,
      });
    });
  });

  if (errors.length) {
    return res
      .status(400)
      .json(new ErrorResponse('Dados inválidos', 'VALIDATION_ERROR', errors));
  }

  next();
}

function validateProposal(req, res, next) {
  const { valorProposto, pesoTotalDia } = req.body;
  const errors = validateFreightFields(req.body);

  if (
    !valorProposto ||
    Number.isNaN(Number(valorProposto)) ||
    Number(valorProposto) <= 0
  ) {
    errors.push({
      field: 'valorProposto',
      message: 'Valor proposto deve ser maior que zero.',
    });
  }

  if (
    !pesoTotalDia ||
    Number.isNaN(Number(pesoTotalDia)) ||
    Number(pesoTotalDia) <= 0
  ) {
    errors.push({
      field: 'pesoTotalDia',
      message: 'Peso total do dia deve ser maior que zero.',
    });
  }

  if (errors.length) {
    return res
      .status(400)
      .json(new ErrorResponse('Dados inválidos', 'VALIDATION_ERROR', errors));
  }

  next();
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  const status = err.status || 500;

  res.status(status).json(new ErrorResponse(err.message || 'Erro interno'));
}

module.exports = {
  validateQuote,
  validateSimulateDay,
  validateProposal,
  errorHandler,
};