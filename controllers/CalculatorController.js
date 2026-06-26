const RouteRepository = require('../repositories/RouteRepository');

class CalculatorController {
  async config(req, res, next) {
    try {
      const config = await RouteRepository.getRouteConfig();

      res.json({
        ok: true,
        route: config.route,
        parameters: config.parameters,
        costs: config.DEFAULT_COSTS,
        tableWeights: config.TABLE_WEIGHTS,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CalculatorController();