/**
 * Parâmetros de custo operacional (editáveis pelo usuário na aba Custos).
 * Todos os valores numéricos são em R$.
 */
class OperationalCostParams {
  /**
   * @param {object} p
   * @param {number} p.kmDia
   * @param {number} p.kmL          km por litro
   * @param {number} p.dieselL      preço do diesel por litro
   * @param {number} p.motorista    diária motorista autônomo
   * @param {number} p.seguroVeic   seguro veículo/dia
   * @param {number} p.manutKmR     manutenção por km (R$/km)
   * @param {number} p.parcelaVeic  parcela do financiamento/dia
   * @param {number} p.pedagios
   * @param {number} p.seguroCarga  RCTR-C + RC-DC/dia
   */
  constructor(p = {}) {
    this.kmDia       = p.kmDia       ?? 340;
    this.kmL         = p.kmL         ?? 11;
    this.dieselL     = p.dieselL     ?? 6.20;
    this.motorista   = p.motorista   ?? 200.00;
    this.seguroVeic  = p.seguroVeic  ?? 20.00;
    this.manutKmR    = p.manutKmR    ?? 0.12;
    this.parcelaVeic = p.parcelaVeic ?? 100.00;
    this.pedagios    = p.pedagios    ?? 80.00;
    this.seguroCarga = p.seguroCarga ?? 19.00;
  }
}

/**
 * Resultado do cálculo de custo operacional diário.
 */
class OperationalCostResult {
  constructor(p) {
    this.diesel      = p.diesel;
    this.manutencao  = p.manutencao;
    this.motorista   = p.motorista;
    this.seguroVeic  = p.seguroVeic;
    this.parcelaVeic = p.parcelaVeic;
    this.pedagios    = p.pedagios;
    this.seguroCarga = p.seguroCarga;
    this.total       = p.total;
  }
}

/**
 * Meta de break-even para uma margem alvo.
 */
class BreakEvenTarget {
  /**
   * @param {number} meta               0..1 (ex: 0.20 = 20%)
   * @param {string} metaLabel
   * @param {number} receitaNecessaria  R$/dia para atingir a meta
   */
  constructor(meta, metaLabel, receitaNecessaria) {
    this.meta               = meta;
    this.metaLabel          = metaLabel;
    this.receitaNecessaria  = receitaNecessaria;
  }
}

module.exports = { OperationalCostParams, OperationalCostResult, BreakEvenTarget };
