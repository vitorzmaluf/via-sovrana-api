const CostService = require('../services/CostService');
const { CostRequest, CostResponse } = require('../dto');

class CostController {
  async calculate(req, res, next) {
    try {
      const dto = new CostRequest(req.body);
      const { custos, metas } = await CostService.calcBreakEven(dto);

      res.json(new CostResponse(custos, metas));
    } catch (err) {
      next(err);
    }
  }

  async defaults(req, res, next) {
    try {
      const defaults = await CostService.getDefaults();
      res.json({ defaults });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CostController();