/**
 * Via Sovrana — API Client
 * Usado pelo frontend para chamar o backend.
 * Substitui todos os cálculos inline do script.js da calculadora.
 *
 * Troque BASE_URL pelo endereço real quando fizer deploy na Hostinger.
 */

const BASE_URL = 'https://api.viasovrana.com.br'; // TODO: trocar pelo URL da Hostinger

// ─────────────────────────────────────────
//  HELPER INTERNO
// ─────────────────────────────────────────
async function api(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Erro ${res.status}`;
    throw new ApiError(msg, data?.error?.code, data?.error?.details, res.status);
  }

  return data;
}

// ─────────────────────────────────────────
//  ERRO TIPADO
// ─────────────────────────────────────────
class ApiError extends Error {
  constructor(message, code, details = [], status = 500) {
    super(message);
    this.name    = 'ApiError';
    this.code    = code;
    this.details = details;
    this.status  = status;
  }
}

// ─────────────────────────────────────────
//  REFERÊNCIAS
// ─────────────────────────────────────────

/** @returns {Promise<{cidades: object[], zonas: object[]}>} */
function getReferences() {
  return api('GET', '/api/freight/references');
}

// ─────────────────────────────────────────
//  ENVIO ÚNICO
// ─────────────────────────────────────────

/**
 * @param {string} cityKey
 * @param {string} zoneKey
 * @param {number} pesoKg
 * @returns {Promise<FreightQuoteResponse>}
 */
function quoteFreight(cityKey, zoneKey, pesoKg) {
  return api('POST', '/api/freight/quote', { cityKey, zoneKey, pesoKg });
}

// ─────────────────────────────────────────
//  SIMULAR DIA
// ─────────────────────────────────────────

/**
 * @param {Array<{id?, nome?, cityKey, zoneKey, pesoKg}>} clientes
 * @param {object} [custos]   parâmetros opcionais de custo operacional
 * @returns {Promise<SimulateDayResponse>}
 */
function simulateDay(clientes, custos = null) {
  return api('POST', '/api/freight/simulate-day', { clientes, custos });
}

// ─────────────────────────────────────────
//  TABELA DE PREÇOS
// ─────────────────────────────────────────

/** @returns {Promise<{pesos: string[], rows: object[]}>} */
function getPriceTable() {
  return api('GET', '/api/freight/table');
}

// ─────────────────────────────────────────
//  PROPOSTA CLIENTE
// ─────────────────────────────────────────

/**
 * @param {string} cityKey
 * @param {string} zoneKey
 * @param {number} pesoKg
 * @param {number} valorProposto
 * @param {number} pesoTotalDia
 * @param {object} [custos]
 * @returns {Promise<ProposalResponse>}
 */
function analyzeProposal(cityKey, zoneKey, pesoKg, valorProposto, pesoTotalDia, custos = null) {
  return api('POST', '/api/freight/proposal', {
    cityKey, zoneKey, pesoKg, valorProposto, pesoTotalDia, custos,
  });
}

// ─────────────────────────────────────────
//  CUSTOS / BREAK-EVEN
// ─────────────────────────────────────────

/**
 * @param {object} [params]   campos de OperationalCostParams (todos opcionais)
 * @returns {Promise<{custos: object, metas: object[]}>}
 */
function calculateCosts(params = {}) {
  return api('POST', '/api/costs/calculate', params);
}

/** @returns {Promise<{defaults: object}>} */
function getCostDefaults() {
  return api('GET', '/api/costs/defaults');
}

// ─────────────────────────────────────────
//  EXPORTS (compatível com módulo ES e browser global)
// ─────────────────────────────────────────
const ViaSovranaAPI = {
  getReferences,
  quoteFreight,
  simulateDay,
  getPriceTable,
  analyzeProposal,
  calculateCosts,
  getCostDefaults,
  ApiError,
};

if (typeof module !== 'undefined') module.exports = ViaSovranaAPI;
else window.ViaSovranaAPI = ViaSovranaAPI;
