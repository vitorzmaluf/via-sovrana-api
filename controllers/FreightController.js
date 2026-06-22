const FreightService = require('../services/FreightService');
const {
  FreightQuoteRequest,
  FreightQuoteResponse,
  SimulateDayRequest,
  SimulateDayResponse,
  PriceTableResponse,
  ProposalRequest,
  ProposalResponse,
  ReferencesResponse,
} = require('../dto');

class FreightController {

  /**
   * POST /api/freight/quote
   * Calcula frete de um envio único.
   */
  quote(req, res, next) {
    try {
      const dto    = new FreightQuoteRequest(req.body);
      const result = FreightService.quote(dto.cityKey, dto.zoneKey, dto.pesoKg);
      res.json(new FreightQuoteResponse(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/freight/simulate-day
   * Simula um dia com múltiplos clientes.
   */
  simulateDay(req, res, next) {
    try {
      const dto    = new SimulateDayRequest(req.body);
      const result = FreightService.simulateDay(dto.clientes, dto.custos);
      res.json(new SimulateDayResponse(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/freight/table
   * Retorna a tabela completa de preços.
   */
  priceTable(req, res, next) {
    try {
      const table = FreightService.buildPriceTable();
      res.json(new PriceTableResponse(table));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/freight/proposal
   * Avalia se uma proposta de cliente é viável.
   */
  proposal(req, res, next) {
    try {
      const dto    = new ProposalRequest(req.body);
      const result = FreightService.analyzeProposal(
        dto.cityKey, dto.zoneKey, dto.pesoKg,
        dto.valorProposto, dto.pesoTotalDia, dto.custos
      );
      res.json(new ProposalResponse(result));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/freight/references
   * Retorna cidades e zonas disponíveis (para popular selects no frontend).
   */
  references(req, res, next) {
    try {
      const { cidades, zonas } = FreightService.getReferences();
      res.json(new ReferencesResponse(cidades, zonas));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FreightController();
