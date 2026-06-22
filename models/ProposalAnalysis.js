/**
 * Vereditos possíveis para uma proposta de cliente.
 */
const Verdict = Object.freeze({
  ACCEPT:    'accept',     // acima da tabela
  VIABLE:    'viable',     // acima do mínimo recomendado
  NEGOTIATE: 'negotiate',  // abaixo do rec, mas cobre custo
  REFUSE:    'refuse',     // não cobre custo operacional
});

/**
 * Análise completa de uma proposta recebida de um cliente.
 */
class ProposalAnalysis {
  /**
   * @param {object} p
   * @param {import('./FreightResult')} p.frete
   * @param {number}  p.valorProposto
   * @param {number}  p.minimoAbs         piso absoluto (cobre só custo+tributo)
   * @param {number}  p.minimoRec         piso recomendado (+15%)
   * @param {number}  p.contraproposta    valor sugerido (tabela cheia)
   * @param {number}  p.lucroSeProposta
   * @param {number}  p.margemSeProposta  0..1
   * @param {number}  p.custoRateado
   * @param {string}  p.verdito           Verdict constant
   * @param {string}  p.verditoLabel      texto legível
   */
  constructor(p) {
    this.frete             = p.frete;
    this.valorProposto     = p.valorProposto;
    this.minimoAbs         = p.minimoAbs;
    this.minimoRec         = p.minimoRec;
    this.contraproposta    = p.contraproposta;
    this.lucroSeProposta   = p.lucroSeProposta;
    this.margemSeProposta  = p.margemSeProposta;
    this.custoRateado      = p.custoRateado;
    this.verdito           = p.verdito;
    this.verditoLabel      = p.verditoLabel;
  }
}

module.exports = { ProposalAnalysis, Verdict };
