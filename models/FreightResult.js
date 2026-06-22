/**
 * Resultado de um cálculo de frete para um envio único.
 * Imutável após construção.
 */
class FreightResult {
  /**
   * @param {object} p
   * @param {string}  p.cityKey
   * @param {string}  p.cityLabel
   * @param {string}  p.zoneKey
   * @param {string}  p.zoneLabel
   * @param {number}  p.pesoKg
   * @param {number}  p.taxaFixa
   * @param {number}  p.taxaZona
   * @param {number}  p.carga        peso × R$/kg
   * @param {number}  p.bruto        frete cobrado total
   * @param {number}  p.icms
   * @param {number}  p.lp
   * @param {number}  p.tributos
   * @param {number}  p.liquido      bruto − tributos
   * @param {number}  p.rKgEfetivo   bruto / pesoKg
   */
  constructor(p) {
    this.cityKey    = p.cityKey;
    this.cityLabel  = p.cityLabel;
    this.zoneKey    = p.zoneKey;
    this.zoneLabel  = p.zoneLabel;
    this.pesoKg     = p.pesoKg;
    this.taxaFixa   = p.taxaFixa;
    this.taxaZona   = p.taxaZona;
    this.carga      = p.carga;
    this.bruto      = p.bruto;
    this.icms       = p.icms;
    this.lp         = p.lp;
    this.tributos   = p.tributos;
    this.liquido    = p.liquido;
    this.rKgEfetivo = p.rKgEfetivo;
    Object.freeze(this);
  }
}

module.exports = FreightResult;
