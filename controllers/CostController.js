const CostService         = require('../services/CostService');
const { CostRequest, CostResponse } = require('../dto');

class CostController {

  /**
   * POST /api/costs/calculate
   * Recalcula custo operacional e break-even com parâmetros customizados.
   * Campos ausentes usam o padrão (R$ 651/dia).
   */
  calculate(req, res, next) {
    try {
      const dto              = new CostRequest(req.body);
      const { custos, metas } = CostService.calcBreakEven(dto);
      res.json(new CostResponse(custos, metas));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/costs/defaults
   * Retorna os valores padrão do custo operacional (para pré-preencher o form).
   */
  defaults(req, res, next) {
    try {
      const { DEFAULT_COSTS } = require('../config/domain');
      res.json({ defaults: DEFAULT_COSTS });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CostController();
