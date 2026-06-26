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
  async quote(req, res, next) {
    try {
      const dto = new FreightQuoteRequest(req.body);

      const result = await FreightService.quote(
        dto.cityKey,
        dto.zoneKey,
        dto.pesoKg
      );

      res.json(new FreightQuoteResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async simulateDay(req, res, next) {
    try {
      const dto = new SimulateDayRequest(req.body);
      const result = await FreightService.simulateDay(dto.clientes, dto.custos);

      res.json(new SimulateDayResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async priceTable(req, res, next) {
    try {
      const table = await FreightService.buildPriceTable();
      res.json(new PriceTableResponse(table));
    } catch (err) {
      next(err);
    }
  }

  async proposal(req, res, next) {
    try {
      const dto = new ProposalRequest(req.body);

      const result = await FreightService.analyzeProposal(
        dto.cityKey,
        dto.zoneKey,
        dto.pesoKg,
        dto.valorProposto,
        dto.pesoTotalDia,
        dto.custos
      );

      res.json(new ProposalResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async references(req, res, next) {
    try {
      const { cidades, zonas } = await FreightService.getReferences();
      res.json(new ReferencesResponse(cidades, zonas));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FreightController();