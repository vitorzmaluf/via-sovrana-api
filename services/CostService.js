const {
  TAX: FALLBACK_TAX,
  DEFAULT_COSTS: FALLBACK_DEFAULT_COSTS,
} = require('../config/domain');

const RouteRepository = require('../repositories/RouteRepository');

const {
  OperationalCostParams,
  OperationalCostResult,
  BreakEvenTarget,
} = require('../models/OperationalCost');

class CostService {
  async getCalculatorConfig() {
    try {
      return await RouteRepository.getRouteConfig();
    } catch (error) {
      console.error(
        '[CostService] Falha ao carregar configuração do MySQL. Usando config/domain.js:',
        error.message
      );

      return {
        TAX: FALLBACK_TAX,
        DEFAULT_COSTS: FALLBACK_DEFAULT_COSTS,
      };
    }
  }

  calcDailyCostWithDefaults(input = null, defaultCosts = FALLBACK_DEFAULT_COSTS) {
    const p = new OperationalCostParams({
      ...defaultCosts,
      ...(input || {}),
    });

    const diesel = r2((p.kmDia / p.kmL) * p.dieselL);
    const manutencao = r2(p.kmDia * p.manutKmR);

    const total = r2(
      diesel +
      p.motorista +
      p.seguroVeic +
      manutencao +
      p.parcelaVeic +
      p.pedagios +
      p.seguroCarga
    );

    return new OperationalCostResult({
      diesel,
      manutencao,
      motorista: r2(p.motorista),
      seguroVeic: r2(p.seguroVeic),
      parcelaVeic: r2(p.parcelaVeic),
      pedagios: r2(p.pedagios),
      seguroCarga: r2(p.seguroCarga),
      total,
    });
  }

  calcBreakEvenWithConfig(
    input = null,
    tax = FALLBACK_TAX,
    defaultCosts = FALLBACK_DEFAULT_COSTS
  ) {
    const custos = this.calcDailyCostWithDefaults(input, defaultCosts);

    const metas = [0, 0.2, 0.25, 0.3].map((meta) => {
      const denominador = 1 - tax.LP - tax.ICMS_EFET - meta;

      if (denominador <= 0) {
        return new BreakEvenTarget(
          meta,
          meta === 0 ? 'Zero margem' : `${meta * 100}% margem`,
          0
        );
      }

      return new BreakEvenTarget(
        meta,
        meta === 0 ? 'Zero margem' : `${meta * 100}% margem`,
        r2(custos.total / denominador)
      );
    });

    return { custos, metas };
  }

  async calcDailyCost(input = null) {
    const config = await this.getCalculatorConfig();

    return this.calcDailyCostWithDefaults(
      input,
      config.DEFAULT_COSTS
    );
  }

  async calcBreakEven(input = null) {
    const config = await this.getCalculatorConfig();

    return this.calcBreakEvenWithConfig(
      input,
      config.TAX,
      config.DEFAULT_COSTS
    );
  }

  async getDefaults() {
    const config = await this.getCalculatorConfig();

    return config.DEFAULT_COSTS;
  }

  async saveDefaults(input = {}) {
    return RouteRepository.updateDefaultCosts(input);
  }
}

function r2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

module.exports = new CostService();