const { TAX, DEFAULT_COSTS } = require('../config/domain');
const { OperationalCostParams, OperationalCostResult, BreakEvenTarget } = require('../models/OperationalCost');

class CostService {

  /**
   * Calcula o custo operacional diário dado um conjunto de parâmetros.
   * Parâmetros ausentes usam os valores padrão.
   * @param {Partial<OperationalCostParams>|null} input
   * @returns {OperationalCostResult}
   */
  calcDailyCost(input = null) {
    const p = new OperationalCostParams({ ...DEFAULT_COSTS, ...(input || {}) });

    const diesel     = r2((p.kmDia / p.kmL) * p.dieselL);
    const manutencao = r2(p.kmDia * p.manutKmR);
    const total      = r2(diesel + p.motorista + p.seguroVeic + manutencao +
                          p.parcelaVeic + p.pedagios + p.seguroCarga);

    return new OperationalCostResult({
      diesel,
      manutencao,
      motorista:   r2(p.motorista),
      seguroVeic:  r2(p.seguroVeic),
      parcelaVeic: r2(p.parcelaVeic),
      pedagios:    r2(p.pedagios),
      seguroCarga: r2(p.seguroCarga),
      total,
    });
  }

  /**
   * Calcula o break-even para 4 metas de margem.
   * fórmula: custo ÷ (1 − LP − ICMS_EFET − meta)
   * @param {Partial<OperationalCostParams>|null} input
   * @returns {{ custos: OperationalCostResult, metas: BreakEvenTarget[] }}
   */
  calcBreakEven(input = null) {
    const custos = this.calcDailyCost(input);

    const metas = [0, 0.20, 0.25, 0.30].map(meta => {
      const denominador = 1 - TAX.LP - TAX.ICMS_EFET - meta;
      return new BreakEvenTarget(
        meta,
        meta === 0 ? 'Zero margem' : `${meta * 100}% margem`,
        r2(custos.total / denominador)
      );
    });

    return { custos, metas };
  }
}

function r2(n) {
  return Math.round(n * 100) / 100;
}

const instance = new CostService();

module.exports = instance;
