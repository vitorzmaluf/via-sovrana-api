/**
 * Simulação de um dia completo com múltiplos clientes.
 */
class DailySimulationResult {
  /**
   * @param {object}   p
   * @param {object[]} p.clientes    array de ClientFreightResult
   * @param {object}   p.resumo      totais do dia
   * @param {object}   p.custos      breakdown do custo operacional
   */
  constructor(p) {
    this.clientes = p.clientes;
    this.resumo   = p.resumo;
    this.custos   = p.custos;
  }
}

/**
 * Resultado de frete de um cliente dentro de uma simulação de dia.
 */
class ClientFreightResult {
  /**
   * @param {object} p
   * @param {string|null} p.id
   * @param {string}  p.nome
   * @param {string}  p.cidade
   * @param {string}  p.zona
   * @param {number}  p.pesoKg
   * @param {number}  p.freteBruto
   * @param {number}  p.tributos
   * @param {number}  p.liquido
   * @param {number}  p.custoRateado
   * @param {number}  p.lucro
   * @param {number}  p.margem        0..1
   * @param {number}  p.rKgEfetivo
   */
  constructor(p) {
    this.id           = p.id   ?? null;
    this.nome         = p.nome ?? null;
    this.cidade       = p.cidade;
    this.zona         = p.zona;
    this.pesoKg       = p.pesoKg;
    this.freteBruto   = p.freteBruto;
    this.tributos     = p.tributos;
    this.liquido      = p.liquido;
    this.custoRateado = p.custoRateado;
    this.lucro        = p.lucro;
    this.margem       = p.margem;
    this.rKgEfetivo   = p.rKgEfetivo;
  }
}

/**
 * Resumo financeiro do dia.
 */
class DaySummary {
  constructor(p) {
    this.pesoTotal     = p.pesoTotal;
    this.receitaTotal  = p.receitaTotal;
    this.tributosTotal = p.tributosTotal;
    this.liquidoTotal  = p.liquidoTotal;
    this.custoDia      = p.custoDia;
    this.lucroTotal    = p.lucroTotal;
    this.margemDia     = p.margemDia;   // 0..1
  }
}

module.exports = { DailySimulationResult, ClientFreightResult, DaySummary };
