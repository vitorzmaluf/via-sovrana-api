/**
 * Via Sovrana — Data Transfer Objects
 *
 * Cada classe representa o contrato de entrada (Request) ou
 * saída (Response) de um endpoint específico.
 * Validação acontece no middleware; aqui só estrutura.
 */

// ─────────────────────────────────────────
//  ENVIO ÚNICO
// ─────────────────────────────────────────

class FreightQuoteRequest {
  /**
   * POST /api/freight/quote
   * @param {string} cityKey   ex: "sorocaba"
   * @param {string} zoneKey   ex: "z1"
   * @param {number} pesoKg
   */
  constructor({ cityKey, zoneKey, pesoKg }) {
    this.cityKey = cityKey;
    this.zoneKey = zoneKey;
    this.pesoKg  = Number(pesoKg);
  }
}

class FreightQuoteResponse {
  /** @param {import('../models/FreightResult')} result */
  constructor(result) {
    this.cidade     = result.cityLabel;
    this.zona       = result.zoneLabel;
    this.pesoKg     = result.pesoKg;
    this.composicao = {
      taxaFixa:  result.taxaFixa,
      carga:     result.carga,
      taxaZona:  result.taxaZona,
    };
    this.freteBruto   = result.bruto;
    this.icms         = result.icms;
    this.lp           = result.lp;
    this.tributos     = result.tributos;
    this.freteliquido = result.liquido;
    this.rKgEfetivo   = result.rKgEfetivo;
  }
}

// ─────────────────────────────────────────
//  SIMULAR DIA
// ─────────────────────────────────────────

class SimulateDayRequest {
  /**
   * POST /api/freight/simulate-day
   * @param {Array<{id?, nome?, cityKey, zoneKey, pesoKg}>} clientes
   * @param {object} [custos]  parâmetros de OperationalCostParams (opcional)
   */
  constructor({ clientes, custos }) {
    this.clientes = (clientes || []).map(c => ({
      id:      c.id   ?? null,
      nome:    c.nome ?? null,
      cityKey: c.cityKey,
      zoneKey: c.zoneKey,
      pesoKg:  Number(c.pesoKg),
    }));
    this.custos = custos ?? null;
  }
}

class SimulateDayResponse {
  /** @param {import('../models/DailySimulation').DailySimulationResult} result */
  constructor(result) {
    this.clientes = result.clientes;
    this.resumo   = result.resumo;
    this.custos   = result.custos;
  }
}

// ─────────────────────────────────────────
//  TABELA DE PREÇOS
// ─────────────────────────────────────────

class PriceTableResponse {
  /** @param {{ pesos: string[], rows: object[] }} table */
  constructor(table) {
    this.pesos = table.pesos;
    this.rows  = table.rows;
  }
}

// ─────────────────────────────────────────
//  PROPOSTA CLIENTE
// ─────────────────────────────────────────

class ProposalRequest {
  /**
   * POST /api/freight/proposal
   * @param {string} cityKey
   * @param {string} zoneKey
   * @param {number} pesoKg
   * @param {number} valorProposto
   * @param {number} pesoTotalDia   peso total do dia para rateio de custo
   * @param {object} [custos]
   */
  constructor({ cityKey, zoneKey, pesoKg, valorProposto, pesoTotalDia, custos }) {
    this.cityKey       = cityKey;
    this.zoneKey       = zoneKey;
    this.pesoKg        = Number(pesoKg);
    this.valorProposto = Number(valorProposto);
    this.pesoTotalDia  = Number(pesoTotalDia);
    this.custos        = custos ?? null;
  }
}

class ProposalResponse {
  /** @param {import('../models/ProposalAnalysis').ProposalAnalysis} analysis */
  constructor(analysis) {
    this.frete = {
      cidade:    analysis.frete.cityLabel,
      zona:      analysis.frete.zoneLabel,
      pesoKg:    analysis.frete.pesoKg,
      bruto:     analysis.frete.bruto,
      tributos:  analysis.frete.tributos,
      liquido:   analysis.frete.liquido,
    };
    this.valorProposto    = analysis.valorProposto;
    this.minimoAbs        = analysis.minimoAbs;
    this.minimoRec        = analysis.minimoRec;
    this.contraproposta   = analysis.contraproposta;
    this.custoRateado     = analysis.custoRateado;
    this.lucroSeProposta  = analysis.lucroSeProposta;
    this.margemSeProposta = analysis.margemSeProposta;
    this.verdito          = analysis.verdito;
    this.verditoLabel     = analysis.verditoLabel;
  }
}

// ─────────────────────────────────────────
//  CUSTOS / BREAK-EVEN
// ─────────────────────────────────────────

class CostRequest {
  /**
   * POST /api/costs/calculate
   * Todos os campos são opcionais — ausentes usam o padrão.
   */
  constructor(body = {}) {
    this.kmDia       = body.kmDia       != null ? Number(body.kmDia)       : undefined;
    this.kmL         = body.kmL         != null ? Number(body.kmL)         : undefined;
    this.dieselL     = body.dieselL     != null ? Number(body.dieselL)     : undefined;
    this.motorista   = body.motorista   != null ? Number(body.motorista)   : undefined;
    this.seguroVeic  = body.seguroVeic  != null ? Number(body.seguroVeic)  : undefined;
    this.manutKmR    = body.manutKmR    != null ? Number(body.manutKmR)    : undefined;
    this.parcelaVeic = body.parcelaVeic != null ? Number(body.parcelaVeic) : undefined;
    this.pedagios    = body.pedagios    != null ? Number(body.pedagios)    : undefined;
    this.seguroCarga = body.seguroCarga != null ? Number(body.seguroCarga) : undefined;
  }
}

class CostResponse {
  /**
   * @param {import('../models/OperationalCost').OperationalCostResult} cost
   * @param {import('../models/OperationalCost').BreakEvenTarget[]} metas
   */
  constructor(cost, metas) {
    this.custos = cost;
    this.metas  = metas;
  }
}

// ─────────────────────────────────────────
//  REFERÊNCIAS (cidades, zonas)
// ─────────────────────────────────────────

class ReferencesResponse {
  constructor(cities, zones) {
    this.cidades = cities;
    this.zonas   = zones;
  }
}

// ─────────────────────────────────────────
//  ERRO PADRÃO
// ─────────────────────────────────────────

class ErrorResponse {
  /**
   * @param {string}   message
   * @param {string}   [code]     código de erro legível por máquina
   * @param {object[]} [details]  erros de validação por campo
   */
  constructor(message, code = 'INTERNAL_ERROR', details = []) {
    this.error   = { message, code, details };
  }
}

module.exports = {
  FreightQuoteRequest,
  FreightQuoteResponse,
  SimulateDayRequest,
  SimulateDayResponse,
  PriceTableResponse,
  ProposalRequest,
  ProposalResponse,
  CostRequest,
  CostResponse,
  ReferencesResponse,
  ErrorResponse,
};
