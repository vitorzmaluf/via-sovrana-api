/**
 * Representa uma cidade atendida pela Via Sovrana.
 */
class City {
  /** @param {string} key  @param {string} label  @param {number} km  @param {number} taxaFixa */
  constructor(key, label, km, taxaFixa) {
    this.key      = key;
    this.label    = label;
    this.km       = km;
    this.taxaFixa = taxaFixa;
  }
}

module.exports = City;
