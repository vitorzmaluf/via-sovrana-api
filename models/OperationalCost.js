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
    this.kmDia = Number(p.kmDia);
    this.kmL = Number(p.kmL);
    this.dieselL = Number(p.dieselL);
    this.motorista = Number(p.motorista);
    this.seguroVeic = Number(p.seguroVeic);
    this.manutKmR = Number(p.manutKmR);
    this.parcelaVeic = Number(p.parcelaVeic);
    this.pedagios = Number(p.pedagios);
    this.seguroCarga = Number(p.seguroCarga);
  }
}

/**
 * Resultado do cálculo de custo operacional diário.
 */
class OperationalCostResult {
  constructor(p) {
    this.diesel = p.diesel;
    this.manutencao = p.manutencao;
    this.motorista = p.motorista;
    this.seguroVeic = p.seguroVeic;
    this.parcelaVeic = p.parcelaVeic;
    this.pedagios = p.pedagios;
    this.seguroCarga = p.seguroCarga;
    this.total = p.total;
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
    this.meta = meta;
    this.metaLabel = metaLabel;
    this.receitaNecessaria = receitaNecessaria;
  }
}

module.exports = { OperationalCostParams, OperationalCostResult, BreakEvenTarget };
